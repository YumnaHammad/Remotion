"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASPECT_PRESETS } from "@/lib/constants";
import { toast } from "sonner";

const schema = z.object({
  prompt: z.string().min(8, "Describe your video in more detail"),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
});

type FormValues = z.infer<typeof schema>;

export function CreateAIDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: "",
      aspectRatio: "16:9",
    },
  });

  const onSubmit = (values: FormValues) => {
    setOpen(false);
    toast.success("Opening Script to Video");
    const params = new URLSearchParams({
      script: values.prompt,
      aspectRatio: values.aspectRatio,
    });
    router.push(`/script-to-video?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="glow">
            <Sparkles className="h-4 w-4" /> Create with AI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create from script</DialogTitle>
          <DialogDescription>
            Describe your video script. On the next page you can toggle
            client-side (local) or server-side (cloud API) processing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Script</Label>
            <Textarea
              placeholder="The business collapsed overnight [WHOOSH EFFECT]. The founder lost everything. But then, he had a breakthrough [DING EFFECT]!"
              rows={4}
              {...form.register("prompt")}
            />
            {form.formState.errors.prompt && (
              <p className="text-xs text-destructive">
                {form.formState.errors.prompt.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Aspect ratio</Label>
            <Select
              value={form.watch("aspectRatio")}
              onValueChange={(v) =>
                form.setValue("aspectRatio", v as FormValues["aspectRatio"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["16:9", "9:16", "1:1"] as const).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r} · {ASPECT_PRESETS[r]?.label ?? r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="glow" className="w-full">
            <Sparkles className="h-4 w-4" /> Open Script to Video
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
