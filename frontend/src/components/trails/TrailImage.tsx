import Image from 'next/image';
import type { CSSProperties } from 'react';
import { isOptimizableImage } from '@/utils/remoteImages';

interface Props {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
}

/**
 * Fills its (position: relative) parent. Uses next/image for known hosts and falls back
 * to a plain <img> for anything else, so unknown hosts never break the page.
 */
const TrailImage = ({ src, alt, sizes = '100vw', priority = false, style }: Props) => {
  const fill: CSSProperties = { objectFit: 'cover', ...style };
  if (isOptimizableImage(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={fill} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- host not configured for next/image
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...fill }}
    />
  );
};

export default TrailImage;
