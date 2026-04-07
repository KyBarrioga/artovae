"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { tiles } from "static/costants";
import Header from "layouts/header";
import { api } from "lib/apiClient";
import { useUserStore } from "store/useUserStore";

const GRID_COLUMNS = 8;
const GRID_ROWS = 4;
const GRID_CAPACITY = GRID_COLUMNS * GRID_ROWS;
const imageFiles = tiles;
const USER2_LAYOUT_STORAGE_KEY = "picsal:user2:grid-order";
const TILE_SIZE = 140;
const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#23160a" />
          <stop offset="100%" stop-color="#0b0b0b" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#avatarBg)" />
      <circle cx="80" cy="62" r="28" fill="#f6e7bf" />
      <path d="M32 138c9-24 28-38 48-38s39 14 48 38" fill="#f6e7bf" />
      <circle cx="80" cy="80" r="76" fill="none" stroke="#d4a017" stroke-width="4" />
    </svg>
  `);

type GridItem = {
  id: string;
  src: string;
};

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

  if (value.startsWith("/")) {
    return value;
  }

  if (value.startsWith("img/")) {
    return `/static/${value}`;
  }

  return `/static/img/${value}`;
}

const DEFAULT_ITEMS: GridItem[] = imageFiles.slice(0, GRID_CAPACITY).map((image, index) => ({
  id: `tile-${index + 1}`,
  src: resolveImageSource(image),
}));

function TileCard({
  item,
  isDragging = false,
}: {
  item: GridItem;
  isDragging?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-panel ${isDragging ? "opacity-90" : ""}`}
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
    >
      <img
        src={item.src}
        alt=""
        draggable={false}
        className="h-full w-full object-cover select-none"
      />
    </div>
  );
}

const SortableTile = memo(function SortableTile({
  item,
}: {
  item: GridItem;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    willChange: "transform",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="block cursor-grab active:cursor-grabbing"
    >
      <TileCard item={item} isDragging={isDragging} />
    </div>
  );
});

export default function UserTwoPage() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [items, setItems] = useState<GridItem[]>(DEFAULT_ITEMS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items]
  );
  const displayName =
    user?.profile.display_name?.trim() ||
    user?.auth_user.display_name?.trim() ||
    user?.auth_user.email ||
    "";
  const email = user?.auth_user.email || "";
  const handle = email ? `@${email.split("@")[0].toLowerCase()}` : "";
  const description = user?.profile.description?.trim() || "";
  const joinedLabel = user?.profile.created_at
    ? new Date(user.profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const profileImage = user?.profile.profile_picture || DEFAULT_PROFILE_IMAGE;

  useEffect(() => {
    if (user) {
      return;
    }

    let isMounted = true;

    async function loadUserProfile() {
      setIsProfileLoading(true);

      try {
        const response = await api.get("/api/user/me");

        if (!isMounted) {
          return;
        }

        setUser(response.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Unable to load profile", error);
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    }

    void loadUserProfile();

    return () => {
      isMounted = false;
    };
  }, [setUser, user]);

  useEffect(() => {
    const savedOrder = window.localStorage.getItem(USER2_LAYOUT_STORAGE_KEY);

    if (!savedOrder) {
      return;
    }

    try {
      const orderedIds = JSON.parse(savedOrder) as string[];
      const itemsById = new Map(DEFAULT_ITEMS.map((item) => [item.id, item]));
      const restoredItems = orderedIds
        .map((id) => itemsById.get(id))
        .filter((item): item is GridItem => Boolean(item));
      const missingItems = DEFAULT_ITEMS.filter(
        (item) => !restoredItems.some((restoredItem) => restoredItem.id === item.id)
      );

      if (restoredItems.length > 0) {
        setItems([...restoredItems, ...missingItems]);
      }
    } catch {
      window.localStorage.removeItem(USER2_LAYOUT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      USER2_LAYOUT_STORAGE_KEY,
      JSON.stringify(items.map((item) => item.id))
    );
  }, [items]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    setItems((currentItems) => {
      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return currentItems;
      }

      return arrayMove(currentItems, oldIndex, newIndex);
    });
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <main>
      <Header />
      <div className="min-h-[calc(100vh-<header-height>px)] px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          <section className="border-white/10 pt-2">
            <div className="mx-auto max-w-[600px]">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center
                    overflow-hidden rounded-full bg-[#111111] text-5xl font-semibold uppercase
                    tracking-[0.16em] text-stone-100 sm:mx-0 sm:h-32 sm:w-32">
                    <img
                      src={profileImage}
                      alt={`${displayName} profile`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 pt-1 text-center sm:text-left">
                    <h1 className="text-[15px] font-semibold leading-tight text-stone-50 sm:text-[24px]">
                      {displayName || (isProfileLoading ? "Loading..." : "Profile")}
                    </h1>
                    {handle ? (
                      <p className="mt-1 text-sm text-stone-500 sm:text-base">{handle}</p>
                    ) : null}

                    {(description || email || joinedLabel) ? (
                      <div className="mt-4 space-y-1.5 text-sm leading-6 text-stone-100 sm:text-[15px]">
                        {description ? <p>{description}</p> : null}
                        {email ? <p>contact: {email}</p> : null}
                        {joinedLabel ? <p className="text-stone-400">joined {joinedLabel}</p> : null}
                      </div>
                    ) : null}
                    {!description && !email && !joinedLabel && isProfileLoading ? (
                      <p className="mt-4 text-sm text-stone-500">Loading profile details...</p>
                    ) : null}

                  </div>
                </div>

                <div className="flex justify-center sm:justify-end">
                  <button
                    type="button"
                    className="rounded-full mt-1 bg-[#1d9bf0] px-5 py-1 text-sm font-medium text-white transition hover:bg-[#1a8cd8] sm:text-base"
                  >
                    Edit profile
                  </button>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-10 text-sm text-stone-500 sm:gap-16 sm:text-base">
                <button
                  type="button"
                  className="border-b-2 border-stone-100 px-1 pb-3 font-medium text-stone-100"
                >
                  Posts
                </button>
                <button type="button" className="px-1 pb-3 transition hover:text-stone-300">
                  Portfolio
                </button>
              </div>
            </div>
          </section>

          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-stone-400">Drag tiles to reorder the grid.</p>
          </div>

          <div className="p-0">
            <div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                measuring={{
                  droppable: {
                    strategy: MeasuringStrategy.BeforeDragging,
                  },
                }}
                autoScroll={false}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <SortableContext items={itemIds} strategy={rectSortingStrategy}>
                  <div
                    className="grid justify-center gap-0"
                    style={{ gridTemplateColumns: `repeat(auto-fit, ${TILE_SIZE}px)` }}
                  >
                    {items.map((item) => (
                      <SortableTile key={item.id} item={item} />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay dropAnimation={null}>
                  {activeItem ? (
                    <div style={{ width: TILE_SIZE, height: TILE_SIZE }}>
                      <TileCard item={activeItem} isDragging />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
