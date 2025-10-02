"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 
      "application/pdf": [".pdf"],
      "text/plain": [".txt"]
    },
    multiple: false,
    onDrop: async (files) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("resume", files[0]);

        // Try simple upload first
        const res = await fetch("/api/simple-upload", { method: "POST", body: formData });
        const json = await res.json();
        setProfile(json.profile);
      } catch (error) {
        console.error("Upload error:", error);
        setProfile({ error: "Upload failed" });
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Start Your Automated Job Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-gray-400"
          >
            <input {...getInputProps()} />
            <p className="mt-2 text-sm text-gray-600">Drop your resume here or click to upload</p>
          </div>

          {uploading && <div className="mt-4 animate-pulse">Processing your resume...</div>}

          {profile && (
            <div className="mt-6">
              <div className="text-sm text-gray-600">Parsed profile preview</div>
              <pre className="mt-2 text-xs bg-gray-50 p-3 rounded-md overflow-x-auto">
{JSON.stringify(profile, null, 2)}
              </pre>
              <Button className="mt-4">Continue</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
