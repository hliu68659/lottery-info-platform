import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import React from "react";

interface SortableItemProps {
  id: number;
  title: string;
  content: string;
  displayOrder: number;
  visible: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onToggleVisibility: (id: number, visible: boolean) => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

function SortableTextItem({
  id,
  title,
  content,
  displayOrder,
  visible,
  isSelected,
  onToggleSelect,
  onToggleVisibility,
  onEdit,
  onDelete,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`card-elegant ${isDragging ? "ring-2 ring-blue-500" : ""}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(id)}
            />
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              title="拖拽排序"
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
            </button>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(id, visible)}
            >
              {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit({ id, title, content, displayOrder, visible })}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("确定删除？")) {
                  onDelete(id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {content}
        </p>
        <p className="text-xs text-muted-foreground mt-2">显示顺序: {displayOrder}</p>
      </CardContent>
    </Card>
  );
}

interface SortableImageItemProps {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  displayOrder: number;
  visible: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onToggleVisibility: (id: number, visible: boolean) => void;
  onDelete: (id: number) => void;
}

function SortableImageItem({
  id,
  title,
  description,
  imageUrl,
  displayOrder,
  visible,
  isSelected,
  onToggleSelect,
  onToggleVisibility,
  onDelete,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`card-elegant relative ${isDragging ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(id)}
        />
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          title="拖拽排序"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="aspect-video relative overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <p className="text-xs text-muted-foreground">显示顺序: {displayOrder}</p>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleVisibility(id, visible)}
          >
            {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("确定删除？")) {
                onDelete(id);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface TextBlock {
  id: number;
  title: string;
  content: string;
  displayOrder: number;
  visible: boolean;
}

interface ImageBlock {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  displayOrder: number;
  visible: boolean;
}

interface SortableTextListProps {
  items: TextBlock[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleVisibility: (id: number, visible: boolean) => void;
  onEdit: (item: TextBlock) => void;
  onDelete: (id: number) => void;
  onReorder: (items: TextBlock[]) => void;
}

export function SortableTextList({
  items,
  selectedIds,
  onToggleSelect,
  onToggleVisibility,
  onEdit,
  onDelete,
  onReorder,
}: SortableTextListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // 更新displayOrder
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        displayOrder: index,
      }));
      
      onReorder(updatedItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {items.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={selectedIds.size === items.length && items.length > 0}
                onCheckedChange={() => {
                  // 全选逻辑由父组件处理
                }}
              />
              <Label className="text-sm cursor-pointer">全选</Label>
            </div>
          )}
          {items.map((item) => (
            <SortableTextItem
              key={item.id}
              id={item.id}
              title={item.title}
              content={item.content}
              displayOrder={item.displayOrder}
              visible={item.visible}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={onToggleSelect}
              onToggleVisibility={onToggleVisibility}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableImageListProps {
  items: ImageBlock[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleVisibility: (id: number, visible: boolean) => void;
  onDelete: (id: number) => void;
  onReorder: (items: ImageBlock[]) => void;
}

export function SortableImageList({
  items,
  selectedIds,
  onToggleSelect,
  onToggleVisibility,
  onDelete,
  onReorder,
}: SortableImageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // 更新displayOrder
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        displayOrder: index,
      }));
      
      onReorder(updatedItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length > 0 && (
            <div className="col-span-full flex items-center gap-2 mb-2">
              <Checkbox
                checked={selectedIds.size === items.length && items.length > 0}
                onCheckedChange={() => {
                  // 全选逻辑由父组件处理
                }}
              />
              <Label className="text-sm cursor-pointer">全选</Label>
            </div>
          )}
          {items.map((item) => (
            <SortableImageItem
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              displayOrder={item.displayOrder}
              visible={item.visible}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={onToggleSelect}
              onToggleVisibility={onToggleVisibility}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
