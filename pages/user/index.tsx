"use client";

import Image from "next/image";
import { Responsive, useContainerWidth } from "react-grid-layout";
import { useState } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { images } from "static/costants";

const imageFiles = images;

type ImageProperties = {
  key: string;
  class: string;
};

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isResizable: boolean;
};

type Layouts = Record<string, LayoutItem[]>;

export default function UserPage() {
  const [items, setItems] = useState<ImageProperties[]>([]);
  const [layouts, setLayouts] = useState<Layouts>({
    lg: [],
    md: [],
    sm: [],
    xs: [],
  });

  function resolveImageSource(value: string) {
    if (/^https?:\/\/imgur\.com\//i.test(value)) {
      const match = value.match(/imgur\.com\/([a-zA-Z0-9]+)/i);
      if (match) {
        return `https://i.imgur.com/${match[1]}.jpg`;
      }
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return `/static/imgs/${value}`;
  }

  const addGridImg = () => {
    const newKey = `item-${Date.now()}`;

    setItems((prev) => [
      ...prev,
      {
        key: newKey,
        class: "bg-white text-black",
      },
    ]);

    setLayouts((prevLayouts) => {
      const newLayouts: Layouts = { ...prevLayouts };

      Object.keys(newLayouts).forEach((breakpoint) => {
        const currentLayout = [...newLayouts[breakpoint]];

        let width = 2;
        let height = 2;
        let x = 4;
        let y = 0;

        if (breakpoint === "lg") {
          x = Math.ceil(items.length * 2) % 8;
          y = Math.floor(items.length / 4);
        } else if (breakpoint === "md") {
          x = Math.ceil(items.length * 2) % 8;
          y = Math.floor(items.length / 4);
          width = 2;
          height = 1;
        } else if (breakpoint === "sm") {
          x = items.length % 2 === 0 ? 0 : 4;
          y = Math.ceil(items.length * 2);
          width = 4;
          height = 2;
        } else if (breakpoint === "xs") {
          x = items.length % 2 === 0 ? 0 : 4;;
          y = 0;
          width = 4;
          height = 2;
        }

        currentLayout.push({
          i: newKey,
          x,
          y,
          w: width,
          h: height,
          isResizable: false,
        });

        newLayouts[breakpoint] = currentLayout;
      });

      return newLayouts;
    });
  };

  function MyResponsiveGrid() {
    const { width, containerRef, mounted } = useContainerWidth();

    return (
      <div ref={containerRef}>
        {mounted ? (
          <Responsive
            layouts={layouts}
            width={width}
            cols={{ lg: 8, md: 8, sm: 8, xs: 8, xxs: 8 }}
            margin={[0, 0]}
          >
            {items.map((item, index) => (
              <div className={item.class} key={item.key}>
                {item.key}
                <Image
                    src={resolveImageSource(imageFiles[index])}
                    alt=""
                    // alt={`${item.title} by ${item.artist}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1440px) 16vw, 12vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.015]"
                    // priority={item.id <= 10}
                    // unoptimized
                  />
              </div>
            ))}
          </Responsive>
        ) : null}
      </div>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <button onClick={addGridImg} className="bg-white text-[#000000]">
        Add Grid
      </button>
      <div className="w-full h-full">
        <MyResponsiveGrid />
      </div>
    </main>
  );
}
