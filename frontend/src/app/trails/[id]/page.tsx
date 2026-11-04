import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert, AlertTitle, Avatar, Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import { MAPBOX_TOKEN } from '@/config';
import { getTrail } from '@/lib/trails.server';
import type { LngLatTuple, Trail } from '@/types';
import { formatDate, formatPrice } from '@/utils/format';
import { toImageUrl, trailImages } from '@/utils/imageUrl';
import TrailImage from '@/components/trails/TrailImage';
import TrailMapClient from '@/components/map/TrailMapClient';

// Rendered on demand and cached (ISR); trail pages are never prerendered at build time.
export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

const excerpt = (text: string, max = 160) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lookup = await getTrail(id);
  if (lookup.status !== 'ok') {
    return { title: lookup.status === 'not-found' ? 'Trail not found' : 'Trail', robots: { index: false } };
  }
  const { trail } = lookup;
  const description = excerpt(trail.description || `A trail shared by ${trail.uName} on Gantabya.`);
  const cover = trailImages(trail.images)[0];
  return {
    title: trail.title,
    description,
    alternates: { canonical: `/trails/${id}` },
    openGraph: {
      type: 'article',
      title: trail.title,
      description,
      url: `/trails/${id}`,
      images: cover ? [{ url: cover, alt: trail.title }] : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: trail.title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

/** Server-side reverse geocoding (cached for a day); null when unavailable. */
const placeName = async ([lng, lat]: LngLatTuple): Promise<string | null> => {
  if (!MAPBOX_TOKEN || !Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${MAPBOX_TOKEN}`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { features?: { place_name?: string }[] };
    return data.features?.[0]?.place_name ?? null;
  } catch {
    return null;
  }
};

const Detail = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box>
    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography variant="body1">{children}</Typography>
  </Box>
);

const Gallery = ({ trail }: { trail: Trail }) => {
  const images = trailImages(trail.images);
  if (images.length === 0) return null;
  const [cover, ...rest] = images;
  return (
    <Box component="section" aria-label="Photos" sx={{ mb: 4 }}>
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 3, overflow: 'hidden', bgcolor: 'grey.200' }}>
        <TrailImage src={cover} alt={trail.title} priority sizes="(max-width: 1200px) 100vw, 1200px" />
      </Box>
      {rest.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 1.5,
            mt: 1.5,
          }}
        >
          {rest.map((url, i) => (
            <Box
              key={url}
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.200', display: 'block' }}
            >
              <TrailImage src={url} alt={`${trail.title} — photo ${i + 2}`} sizes="(max-width: 600px) 50vw, 240px" />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default async function TrailPage({ params }: Props) {
  const { id } = await params;
  const lookup = await getTrail(id);

  if (lookup.status === 'not-found') notFound();
  if (lookup.status === 'error') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" variant="outlined">
          <AlertTitle>Couldn&apos;t load this trail</AlertTitle>
          {lookup.message}
        </Alert>
        <Typography sx={{ mt: 3, textAlign: 'center' }}>
          <Link href={`/trails/${encodeURIComponent(id)}`}>Try again</Link> · <Link href="/trails">All trails</Link>
        </Typography>
      </Container>
    );
  }

  const { trail } = lookup;
  const [startPlace, finishPlace] = await Promise.all([placeName(trail.sloc), placeName(trail.floc)]);
  const checkpoints = trail.checkp ?? [];

  return (
    <Container maxWidth="lg" component="article" sx={{ py: 4, pb: 10 }}>
      <Typography variant="body2" sx={{ mb: 2 }}>
        <Link href="/trails">← All trails</Link>
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1" color="primary" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>
          {trail.title}
        </Typography>
        <Chip label={formatPrice(trail.price)} color="primary" sx={{ fontSize: '1rem', px: 1 }} />
      </Stack>

      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
        <Avatar src={toImageUrl(trail.uPhoto)} alt={trail.uName}>
          {trail.uName?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography color="text.secondary">
          Shared by <strong>{trail.uName}</strong>
          {trail.createdAt ? ` · ${formatDate(trail.createdAt)}` : ''}
        </Typography>
      </Stack>

      <Gallery trail={trail} />

      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={3} justifyContent="space-between" sx={{ mb: 3 }}>
          <Detail label="Start">{startPlace ?? `${trail.sloc[1].toFixed(4)}, ${trail.sloc[0].toFixed(4)}`}</Detail>
          <Detail label="Finish">{finishPlace ?? `${trail.floc[1].toFixed(4)}, ${trail.floc[0].toFixed(4)}`}</Detail>
          <Detail label="Approx. cost">{formatPrice(trail.price)}</Detail>
          {typeof trail.difficulty === 'number' && <Detail label="Difficulty">{trail.difficulty.toFixed(1)}</Detail>}
        </Stack>
        <Typography variant="h6" component="h2" color="primary" gutterBottom>
          About this trail
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
          {trail.description}
        </Typography>
      </Paper>

      <Box component="section" aria-label="Route map" sx={{ mb: 4 }}>
        <Typography variant="h6" component="h2" color="primary" gutterBottom>
          Route
        </Typography>
        <TrailMapClient sloc={trail.sloc} floc={trail.floc} checkp={checkpoints} />
      </Box>

      {checkpoints.length > 0 && (
        <Box component="section" aria-label="Checkpoints">
          <Typography variant="h6" component="h2" color="primary" gutterBottom>
            Checkpoints
          </Typography>
          <Box component="ol" sx={{ pl: 3, m: 0 }}>
            {checkpoints.map(([lng, lat, description], i) => (
              <Typography component="li" key={`${lng},${lat},${i}`} sx={{ mb: 1 }}>
                {description || `Checkpoint ${i + 1}`}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}
