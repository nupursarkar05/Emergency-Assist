
"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Search, Video } from "lucide-react";

const videoSearchSchema = z.object({
  emergencyQuery: z.string().min(3, { message: "Please enter at least 3 characters for your search." }),
});

type VideoSearchFormValues = z.infer<typeof videoSearchSchema>;

interface VideoResult {
  title: string;
  description: string;
  // For now, using picsum. We can extend this to an actual video URL.
  thumbnailUrl: string;
  videoUrl?: string; // Actual video URL if available
  dataAiHint: string;
}

const VideoGuidePage: NextPage = () => {
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);

  const form = useForm<VideoSearchFormValues>({
    resolver: zodResolver(videoSearchSchema),
    defaultValues: {
      emergencyQuery: "",
    },
  });

  const onSubmit: SubmitHandler<VideoSearchFormValues> = async (data) => {
    setIsLoading(true);
    setVideoResult(null); // Clear previous result
    setSearchedQuery(data.emergencyQuery);

    // Simulate API call to fetch video
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Placeholder video result
    // In a real app, you would fetch this based on data.emergencyQuery
    // For example, searching YouTube API or a curated video database
    setVideoResult({
      title: `First Aid for: ${data.emergencyQuery}`,
      description: `A comprehensive video guide on how to provide first aid for "${data.emergencyQuery}". Follow the steps carefully.`,
      thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(data.emergencyQuery)}/1280/720`,
      dataAiHint: `first aid ${data.emergencyQuery.split(" ")[0] || 'medical'}`, // Basic hint generation
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Placeholder, replace with actual relevant video
    });

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-2">
            <Video className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Emergency Video Guide</CardTitle>
          <CardDescription>
            Enter the type of medical emergency to find a relevant instructional video.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emergencyQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">What is the emergency?</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input placeholder="E.g., 'Choking', 'Burn', 'CPR'" {...field} className="text-base focus-visible:ring-1 focus-visible:ring-primary" />
                      </FormControl>
                       <Button type="submit" disabled={isLoading} className="px-4">
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        <span className="ml-2 hidden sm:inline">Search</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mt-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-lg text-muted-foreground">Searching for videos on "{searchedQuery}"...</p>
        </div>
      )}

      {videoResult && !isLoading && (
        <Card className="mt-8 max-w-3xl mx-auto shadow-xl rounded-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">{videoResult.title}</CardTitle>
            <CardDescription>{videoResult.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              {/* In a real app, you'd use a video player component here (e.g., ReactPlayer or simple <video> tag) */}
              {/* For now, displaying the thumbnail as a placeholder. */}
              <Image
                src={videoResult.thumbnailUrl}
                alt={`Video thumbnail for ${videoResult.title}`}
                width={1280}
                height={720}
                className="w-full h-full object-cover"
                data-ai-hint={videoResult.dataAiHint}
                priority
              />
            </div>
            {videoResult.videoUrl && (
                 <Button asChild className="mt-4 w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    <a href={videoResult.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="mr-2 h-5 w-5" /> Watch Full Video (External)
                    </a>
                </Button>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Note: Video guides are for informational purposes. Always prioritize calling emergency services.
            </p>
          </CardFooter>
        </Card>
      )}
       {!videoResult && !isLoading && searchedQuery && (
        <Card className="mt-8 max-w-3xl mx-auto shadow-xl">
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No video found for "{searchedQuery}". Please try a different search term.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoGuidePage;
