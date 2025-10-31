"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { devicesApi, DeviceInput } from '@/lib/api';
import AuthProtected from '@/components/AuthProtected';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

export default function NewDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<DeviceInput>({
    device_model: '',
    serial_number: '',
    owner_name: '',
    date_enrolled: new Date().toISOString().split('T')[0],
    next_maintenance: '',
    location: '',
    category: '',
    color_tag: '#3b82f6',
    workbook: 'Main',
    notes: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await devicesApi.create(formData);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create device');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof DeviceInput, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <AuthProtected>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Add New Device</CardTitle>
              <CardDescription>Enter the details of the new device to add to inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="device_model">Device Model *</Label>
                    <Input
                      id="device_model"
                      placeholder="e.g., MacBook Pro 16"
                      value={formData.device_model}
                      onChange={(e) => handleChange('device_model', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serial_number">Serial Number *</Label>
                    <Input
                      id="serial_number"
                      placeholder="e.g., ABC123XYZ"
                      value={formData.serial_number}
                      onChange={(e) => handleChange('serial_number', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner Name *</Label>
                    <Input
                      id="owner_name"
                      placeholder="e.g., John Doe"
                      value={formData.owner_name}
                      onChange={(e) => handleChange('owner_name', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Laptop, Desktop, Mobile"
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Lagos Office"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workbook">Workbook *</Label>
                    <Input
                      id="workbook"
                      placeholder="e.g., Main"
                      value={formData.workbook}
                      onChange={(e) => handleChange('workbook', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_enrolled">Date Enrolled *</Label>
                    <Input
                      id="date_enrolled"
                      type="date"
                      value={formData.date_enrolled}
                      onChange={(e) => handleChange('date_enrolled', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next_maintenance">Next Maintenance *</Label>
                    <Input
                      id="next_maintenance"
                      type="date"
                      value={formData.next_maintenance}
                      onChange={(e) => handleChange('next_maintenance', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color_tag">Color Tag</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color_tag"
                        type="color"
                        value={formData.color_tag}
                        onChange={(e) => handleChange('color_tag', e.target.value)}
                        disabled={loading}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.color_tag}
                        onChange={(e) => handleChange('color_tag', e.target.value)}
                        disabled={loading}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this device..."
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    disabled={loading}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Device'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProtected>
  );
}
