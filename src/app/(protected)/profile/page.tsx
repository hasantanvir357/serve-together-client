'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { LoaderCircle, User } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api-client';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [imageDraft, setImageDraft] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const name = nameDraft ?? user?.name ?? '';
  const image = imageDraft ?? user?.image ?? '';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextName = name.trim();
    const nextImage = image.trim();

    if (!nextName) {
      toast.add({ title: 'Name cannot be empty', type: 'error' });
      return;
    }

    if (nextImage) {
      try {
        const imageUrl = new URL(nextImage);
        if (!['http:', 'https:'].includes(imageUrl.protocol)) {
          throw new Error('invalid protocol');
        }
      } catch {
        toast.add({
          title: 'Invalid photo URL',
          description: 'Use a valid http:// or https:// image URL.',
          type: 'error',
        });
        return;
      }
    }

    if (!user?.email) {
      toast.add({ title: 'Update failed', description: 'Your session is not ready.', type: 'error' });
      return;
    }

    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      toast.add({
        title: 'Session expired',
        description: 'Please sign in again before updating your profile.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          email: user.email,
          name: nextName,
          image: nextImage,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      await updateUser({ name: nextName, image: nextImage || undefined });

      toast.add({
        title: 'Profile Updated',
        description: 'Your changes have been saved.',
        type: 'success',
      });

      router.push('/');
    } catch (error) {
      toast.add({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-24 items-center justify-center rounded-full bg-primary/10 overflow-hidden ring-2 ring-primary/20">
            {image ? (
              <img
                src={image}
                alt="Profile Preview"
                className="size-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <User className="size-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-xl">Update Profile</CardTitle>
          <CardDescription>Change your display name and photo URL</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user?.email || ''} disabled className="bg-muted cursor-not-allowed opacity-70" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImageDraft(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin mr-2 size-4" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
