"use client";

import { Responsive, useContainerWidth } from "react-grid-layout";
import { useState } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

type ImageProperties = {
  key: string;
  class: string;
};

export default function UserPage() {

  const [items, setItems] = useState<ImageProperties[]>([
    // {"key": "1",
    //  "color": "bg-white"
    // },
    // // {"key": "2",
    // //   "color": "bg-[#00ff00]"
    // // },
    // // {"key": "3",
    // //   "color": "bg-[#00ff00]"
    // // },
    // // {"key": "4",
    // //   "color": "bg-[#00ff00]"
    // // }
  ]);

  const addGridImg = () => {
    const newKey = `item-${Date.now()}`;

    setItems((prev) => [
      ...prev,
      {
        key: newKey,
        class: "bg-white text-black"
      }
    ]);

    setLayouts((prevLayouts) => {
      const newLayouts = { ...prevLayouts };

      Object.keys(newLayouts).forEach((breakpoint) => {
        const currentLayout = newLayouts[breakpoint];

        console.log(items.length)

        var width = 2
        var height = 2
        var x = 4
        var y = 0

        if (breakpoint.match('lg')) {
          x = Math.ceil(items.length * 2)%8;
          y = Math.floor(items.length / 4)
        }else if (breakpoint.match('sm')){
          if(items.length % 2 == 0){
            x = 0
          } else{
            x = 4
          }
          y = Math.ceil(items.length * 2)
          width = 4
          height = 2
        } else if (breakpoint.match('xs')){ //&& (items.length / 4) < 2
          x=0
          y=0
          width = 8
          height = 2
        }
        // switch (breakpoint) {
        //   case "lg":
        //     x = 0
        //     y = 2
        //   case "sm":
            // x = 0
            // y = 2
        //     break;
        //   case "xs":
            // width = 4
            // height = 2
        //     break;
        // }

        currentLayout.push({
          i: newKey,
          x: x,
          y: y,
          w: width,
          h: height,
          isResizable: false,
        });
      });

      return newLayouts;
    });
  };

  const [layouts, setLayouts] = useState({
    lg: [
      { i: "1", x: 0, y: 0, w: 2, h: 2, isResizable: false },
      { i: "2", x: 2, y: 0, w: 2, h: 2, isResizable: false },
      { i: "3", x: 4, y: 0, w: 2, h: 2, isResizable: false },
      { i: "4", x: 8, y: 0, w: 2, h: 2, isResizable: false },
    ],
    sm: [
      { i: "1", x: 0, y: 0, w: 4, h: 2, isResizable: false },
      { i: "2", x: 4, y: 2, w: 4, h: 2, isResizable: false },
      { i: "3", x: 0, y: 4, w: 4, h: 2, isResizable: false },
      { i: "4", x: 4, y: 8, w: 4, h: 2, isResizable: false },
    ],
    xs: [
      { i: "1", x: 0, y: 0, w: 8, h: 2, isResizable: false },
      { i: "2", x: 0, y: 0, w: 8, h: 2, isResizable: false },
      { i: "3", x: 0, y: 0, w: 8, h: 2, isResizable: false },
      { i: "4", x: 0, y: 0  , w: 8, h: 2, isResizable: false },
    ],
    // md: [
    //   { i: "1", x: 0, y: 0, w: 2, h: 2, isResizable: false },
    //   { i: "2", x: 2, y: 0, w: 2, h: 2, isResizable: false },
    //   { i: "3", x: 4, y: 0, w: 2, h: 2, isResizable: false },
    //   { i: "4", x: 8, y: 0, w: 2, h: 2, isResizable: false },
    // ],
    // xxs: [
    //   { i: "1", x: 0, y: 0, w: 8, h: 2, isResizable: false },
    //   { i: "2", x: 4, y: 0, w: 8, h: 2, isResizable: false },
    // ],
  });

  function MyResponsiveGrid() {
    const { width, containerRef, mounted } = useContainerWidth();

    // const layouts = {
    //   lg: [
    //     { i: "1", x: 0, y: 0, w: 2, h: 2, isResizable: false },
    //     { i: "2", x: 2, y: 0, w: 2, h: 2, isResizable: false },
    //   ],
    //   md: [
    //     { i: "1", x: 0, y: 0, w: 2, h: 2, isResizable: false },
    //     { i: "2", x: 2, y: 0, w: 2, h: 2, isResizable: false },
    //   ],
    //   sm: [
    //     { i: "1", x: 0, y: 0, w: 4, h: 2, isResizable: false },
    //     { i: "2", x: 4, y: 0, w: 4, h: 2, isResizable: false },
    //   ],
    //   xs: [
    //     { i: "1", x: 0, y: 0, w: 4, h: 2, isResizable: false },
    //     { i: "2", x: 4, y: 0, w: 4, h: 2, isResizable: false },
    //   ],
    //   xxs: [
    //     { i: "1", x: 0, y: 0, w: 4, h: 2, isResizable: false },
    //     { i: "2", x: 4, y: 0, w: 4, h: 2, isResizable: false },
    //   ],
    // };

    return (
      <div ref={containerRef}>
        {mounted && (
          <Responsive
            layouts={layouts}
            width={width}
            cols={{ lg: 8, md: 8, sm: 8, xs: 8, xxs: 8 }}
            margin={[0, 0]}
            onLayoutChange={(currentLayout, allLayouts) => {
              console.log("All layouts:", allLayouts);
            }}
          >
            {items.map((item, index)=>(
                <div className={item.class} key={item.key}>{item.key}</div>
            ))}
          </Responsive>
        )}
      </div>
    );
  }
  return (
    <main style={{ padding: "2rem" }}>
      <button onClick={addGridImg} className="bg-white text-[#000000]">Add Grid</button>
      {/* <h1>User Page</h1>

      <section style={{ marginTop: "1rem" }}>
        <p>Welcome to the user page.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>User Info</h2>
        <ul>
          <li>Name: John Doe</li>
          <li>Email: john@example.com</li>
        </ul>
      </section> */}

      {/* ✅ render component properly */}
      <div className="w-full h-full">
        <MyResponsiveGrid />
      </div>
    </main>
  );
}