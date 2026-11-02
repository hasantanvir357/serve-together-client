'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { LoaderCircle, User } from 'lucide-react';
import { authClient } from '@/lib/auth-client'; // আপনার Better Auth ক্লায়েন্ট

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setImage(user.image || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.add({ title: 'Name cannot be empty', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://serve-together-server-ten.vercel.app';

    try {
      // ১. ব্যাকএন্ড ডাটাবেসে আপডেট পাঠানো
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: name.trim(),
          image: image.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // ২. Better Auth-এর ইন্টারনাল ইউজার আপডেট (যদি ক্লায়েন্ট সাপোর্ট করে)
      try {
        if (authClient?.updateUser) {
          await authClient.updateUser({
            name: name.trim(),
            image: image.trim(),
          });
        }
      } catch (authErr) {
        console.warn('Better-auth client sync skipped', authErr);
      }

      toast.add({
        title: 'Profile Updated',
        description: 'Your name and photo have been updated successfully.',
        type: 'success',
      });

      // ৩. স্টেট সরাসরি আপডেট রাখা
      setName(name.trim());
      setImage(image.trim());

      // ৪. সম্পূর্ণ সেশন রিফ্রেশ করে হোম অথবা ড্যাশবোর্ডে সিঙ্ক করা
      setTimeout(() => {
        window.location.reload();
      }, 800);
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
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-xs text-muted-foreground">
                ছবির সরাসরি লিংক দিন (যেমন Clash of Clans বা Unsplash-এর ছবি)।
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin mr-2 size-4" />
                  Saving...
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
