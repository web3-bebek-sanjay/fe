'use client';

import { OptimizedImage } from '@/components/ui/OptimizedImage';

export function ImageTest() {
  const testImages = [
    'https://picsum.photos/seed/test1/200',
    'https://picsum.photos/seed/test2/200',
    '/placeholder.svg',
    '/logo.png',
  ];

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold">Image Loading Test</h3>
      <div className="grid grid-cols-2 gap-4">
        {testImages.map((src, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <OptimizedImage
              src={src}
              alt={`Test image ${index + 1}`}
              aspectRatio="square"
              className="h-32"
              fallbackSrc="/placeholder.svg"
            />
            <div className="p-2 text-xs">
              <code className="break-all">{src}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
