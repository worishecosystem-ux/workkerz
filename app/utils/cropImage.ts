export const getCroppedImg = (
  imageSrc: string,
  pixelCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  rotation = 0
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      const canvas =
        document.createElement("canvas");

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {
        reject(
          new Error(
            "Canvas context not found"
          )
        );
        return;
      }

      const rotRad =
        (rotation * Math.PI) / 180;

      const maxSize = Math.max(
        image.width,
        image.height
      );

      const safeArea =
        maxSize * 2;

      canvas.width = safeArea;
      canvas.height = safeArea;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        0,
        0,
        safeArea,
        safeArea
      );

      ctx.translate(
        safeArea / 2,
        safeArea / 2
      );

      ctx.rotate(rotRad);

      ctx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2
      );

      const cropCanvas =
        document.createElement(
          "canvas"
        );

      const cropCtx =
        cropCanvas.getContext(
          "2d"
        );

      if (!cropCtx) {
        reject(
          new Error(
            "Crop context not found"
          )
        );
        return;
      }

      cropCanvas.width =
        pixelCrop.width;

      cropCanvas.height =
        pixelCrop.height;

      cropCtx.fillStyle =
        "#ffffff";

      cropCtx.fillRect(
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );

      cropCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      cropCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Failed to create blob"
              )
            );
            return;
          }

          resolve(blob);
        },
        "image/jpeg",
        1
      );
    };

    image.onerror = () => {
      reject(
        new Error(
          "Image load failed"
        )
      );
    };
  });
};