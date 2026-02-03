import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { auctionAPI } from "../../lib/api";
import toast from "react-hot-toast";
import { Plus, X, DollarSign, Calendar as CalendarIcon, Clock as ClockIcon, Tag, Gavel } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import { Field, FieldLabel } from "../../components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"
import { Checkbox } from "../../components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import ImageUpload from "../../components/ui/image-upload"
import { format } from "date-fns"


const auctionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.enum([
    "electronics",
    "vehicles",
    "jewelry",
    "art",
    "collectibles",
    "fashion",
    "home",
    "sports",
    "other",
  ]),
  startingPrice: z.number().min(1, "Starting price must be at least $1"),
  reservePrice: z
    .number()
    .min(0, "Reserve price must be $0 or more")
    .optional(),
  auctionEndTime: z.string().min(1, "Auction end time is required"),
  settings: z.object({
    autoExtend: z.boolean().default(true),
    extendMinutes: z
      .number()
      .min(1, "Extend minutes must be at least 1")
      .default(5),
    minBidIncrement: z
      .number()
      .min(1, "Minimum bid increment must be at least $1")
      .default(10),
  }),
});

const CreateAuctionForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      settings: {
        autoExtend: true,
        extendMinutes: 5,
        minBidIncrement: 10,
      },
    },
  });

  const categories = [
    { value: "electronics", label: "Electronics" },
    { value: "vehicles", label: "Vehicles" },
    { value: "jewelry", label: "Jewelry" },
    { value: "art", label: "Art" },
    { value: "collectibles", label: "Collectibles" },
    { value: "fashion", label: "Fashion" },
    { value: "home", label: "Home & Garden" },
    { value: "sports", label: "Sports" },
    { value: "other", label: "Other" },
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Validate that end time is in the future
      const endTime = new Date(data.auctionEndTime);
      const now = new Date();
      if (endTime <= now) {
        toast.error('Auction end time must be in the future');
        return;
      }

      // Validate that at least one image is uploaded
      if (images.length === 0) {
        toast.error('At least one image is required');
        return;
      }

      const response = await auctionAPI.createAuction({
        ...data,
        auctionEndTime: new Date(data.auctionEndTime).toISOString(),
        images: images,
      });

      clearDraft(); // Clear saved data on success
      toast.success('Auction created successfully!');
      navigate('/admin/auctions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDateTime = new Date(Date.now() + 60 * 60 * 1000);

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('createAuctionDraft');
    if (savedData) {
      try {
        const draft = JSON.parse(savedData);
        // Only restore if it's from the same day (to avoid stale data)
        const draftDate = new Date(draft.savedAt);
        const now = new Date();
        if (draftDate.toDateString() === now.toDateString()) {
          Object.keys(draft).forEach(key => {
            if (key !== 'savedAt') {
              setValue(key, draft[key]);
            }
          });
          if (draft.images) {
            setImages(draft.images);
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [setValue]);

  // Save form data to localStorage on change
  useEffect(() => {
    const subscription = watch((value) => {
      const dataToSave = {
        ...value,
        images: images,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('createAuctionDraft', JSON.stringify(dataToSave));
    });
    return () => subscription.unsubscribe();
  }, [watch, images]);

  // Clear localStorage on successful submission
  const clearDraft = () => {
    localStorage.removeItem('createAuctionDraft');
  };

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      {/* Glassmorphic Card */}
      <Card className="relative overflow-hidden bg-transparent border-0 shadow-2xl backdrop-blur-xl">
       
        <CardContent className="relative z-10 p-8 bg-white/30">
          {/* Header */}
          <div className="flex items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Create New Auction
              </h1>
              <p className="text-muted-foreground">
                List your item and start receiving bids
              </p>
            </div>
          </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="block mb-2 text-sm font-medium text-foreground">
                Auction Title
              </Label>
              <Input
                {...register("title")}
                type="text"
                className="w-full px-4 py-3 transition-all border-0 bg-white/20 backdrop-blur rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30"
                placeholder="Enter auction title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label className="block mb-2 text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                {...register("description")}
                rows={4}
                className="w-full px-4 py-3 transition-all border-0 bg-white/20 backdrop-blur rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30"
                placeholder="Describe your item in detail"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block mb-2 text-sm font-medium text-foreground">
                <Tag className="inline w-4 h-4 mr-1" />
                Category
              </Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger className="w-full px-4 py-3 transition-all border-0 bg-white/20 backdrop-blur rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="border-0 bg-white/90 backdrop-blur rounded-xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block mb-2 text-sm font-medium text-gray-700">
                <CalendarIcon className="inline w-4 h-4 mr-1" />
                Auction End Time
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start w-full font-normal"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {watch("auctionEndTime")
                      ? format(new Date(watch("auctionEndTime")), "PPP HH:mm")
                      : <span className="text-gray-400">Pick a date & time</span>
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watch("auctionEndTime") ? new Date(watch("auctionEndTime")) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Preserve existing time or default to current time
                        const existing = watch("auctionEndTime") ? new Date(watch("auctionEndTime")) : new Date();
                        date.setHours(existing.getHours(), existing.getMinutes());
                        setValue("auctionEndTime", date.toISOString());
                      }
                    }}
                    disabled={(date) => {
                      const now = new Date();
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      return selectedDate < today;
                    }}
                    defaultMonth={watch("auctionEndTime") ? new Date(watch("auctionEndTime")) : new Date()}
                  />
                  {/* Time Picker Row */}
                  <div className="flex items-center justify-center gap-2 p-3 border-t">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <select
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                      value={watch("auctionEndTime") ? new Date(watch("auctionEndTime")).getHours() : new Date().getHours() + 1}
                      onChange={(e) => {
                        const date = watch("auctionEndTime") ? new Date(watch("auctionEndTime")) : new Date();
                        date.setHours(Number(e.target.value));
                        // Ensure the date is at least 1 hour in the future
                        const now = new Date();
                        const minTime = new Date(now.getTime() + 60 * 60 * 1000);
                        if (date < minTime) {
                          date.setTime(minTime.getTime());
                        }
                        setValue("auctionEndTime", date.toISOString());
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                      ))}
                    </select>
                    <span className="text-gray-400">:</span>
                    <select
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                      value={watch("auctionEndTime") ? new Date(watch("auctionEndTime")).getMinutes() : 0}
                      onChange={(e) => {
                        const date = watch("auctionEndTime") ? new Date(watch("auctionEndTime")) : new Date();
                        date.setMinutes(Number(e.target.value));
                        // Ensure the date is at least 1 hour in the future
                        const now = new Date();
                        const minTime = new Date(now.getTime() + 60 * 60 * 1000);
                        if (date < minTime) {
                          date.setTime(minTime.getTime());
                        }
                        setValue("auctionEndTime", date.toISOString());
                      }}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                </PopoverContent>
              </Popover>

              {errors.auctionEndTime && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.auctionEndTime.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block mb-2 text-sm font-medium text-foreground">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Starting Price ($)
              </Label>
              <Input
                {...register("startingPrice", { valueAsNumber: true })}
                type="number"
                min="1"
                step="0.01"
                className="w-full px-4 py-3 transition-all border-0 bg-white/20 backdrop-blur rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30"
                placeholder="0.00"
              />
              {errors.startingPrice && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.startingPrice.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block mb-2 text-sm font-medium text-foreground">
                Reserve Price ($) - Optional
              </Label>
              <Input
                {...register("reservePrice", { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 transition-all border-0 bg-white/20 backdrop-blur rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-white/30"
                placeholder="0.00"
              />
              {errors.reservePrice && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.reservePrice.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={5}
            />
          </div>

          <div className="pt-6 border-t">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Auction Settings
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label className="flex items-center space-x-2">
                  <Checkbox
                    checked={watch("settings.autoExtend")}
                    onCheckedChange={(checked) => setValue("settings.autoExtend", checked)}
                  />
                  <span>Auto-extend auction</span>
                </Label>
              </div>
              <div>
                <Label className="block mb-1 text-sm font-medium text-gray-700">
                  Extend minutes
                </Label>
                <Input
                  {...register("settings.extendMinutes", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  disabled={!watch("settings.autoExtend")}
                  className="disabled:opacity-50"
                />
                {errors.settings?.extendMinutes && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.settings.extendMinutes.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="block mb-1 text-sm font-medium text-gray-700">
                  Min bid increment ($)
                </Label>
                <Input
                  {...register("settings.minBidIncrement", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.settings?.minBidIncrement && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.settings.minBidIncrement.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => navigate("/admin/auctions")}
              className="px-6 py-3 transition-all shadow-none bg-white/20 text-muted-foreground rounded-2xl hover:bg-white/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 shadow-none bg-[#E2E687] text-primary rounded-2xl hover:bg-[#E2E687]/90 hover:shadow-lg transition-all"
            >
              {isSubmitting ? "Creating..." : "Create Auction"}
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAuctionForm;
