import { HTMLAttributes, useEffect, useRef, useState } from "react";

import { getPixels } from "@unpic/pixels";
import { blurhashToDataUri } from "@unpic/placeholder";
import { Image as UnpicImage } from "@unpic/react";
import { encode } from "blurhash";

import { cn, generateUrlWithParams } from "~/lib/utils";

interface GenerateBlurhashProps {
  width?: number;
  height: number;
  fit?: string;
}

const generateImageWithBlurhash = async (
  url,
  options: GenerateBlurhashProps,
) => {
  const { width, height, fit } = options;

  try {
    new URL(url); // Validate URL

    const urlWithParams = generateUrlWithParams(url, {
      width: width && Number.isInteger(width) ? `${width / 10}` : undefined,
      height: `${height / 10}`,
      fit: fit || "crop",
    });

    const jpgData = await getPixels(urlWithParams);
    const data = Uint8ClampedArray.from(jpgData.data);

    return {
      src: url,
      blurhash: encode(data, jpgData.width, jpgData.height, 4, 4),
      reducedImage: urlWithParams,
      ...options,
    };
  } catch (err) {
    console.error("Invalid URL:", url, err);

    return {
      src: "",
      ...options,
    };
  }
};

interface UnpicImageProps extends HTMLAttributes<HTMLImageElement> {
  width?: number;
  height: number;
  src: string;
  layout: "fullWidth" | "fixed";
  reducedImage: string;
  blurhash: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

const LazyImage = ({
  width,
  height,
  src,
  reducedImage,
  blurhash,
  className,
  containerClassName,
  ...props
}: UnpicImageProps) => {
  const [isInView, setIsInView] = useState(false);
  const backgroundImage = blurhash ? blurhashToDataUri(blurhash) : reducedImage;

  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // Stop observing once the image is in view
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the image is visible
      },
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  return (
    <div
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
            }
          : {}
      }
      className={cn("relative w-full h-full bg-cover", containerClassName)}
    >
      {/* <link rel="preload" href={backgroundImage} /> */}
      <UnpicImage
        ref={imageRef}
        {...{ ...props, src }}
        layout="fullWidth"
        className={cn(
          "block transition-opacity duration-300 w-full h-full",
          isInView ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
};

export { generateImageWithBlurhash, LazyImage };
