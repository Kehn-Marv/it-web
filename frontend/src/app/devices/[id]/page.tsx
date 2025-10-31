"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { devicesApi, Device, DeviceInput } from '@/lib/api';
import AuthProtected from '@/components/AuthProtected';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Save, Trash2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function DeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = parseInt(params.id as string);

  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DeviceInput>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDevice();
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      const data = await devicesApi.get(deviceId);
      setDevice(data);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load device');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await devicesApi.update(deviceId, formData);
      await fetchDevice();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await devicesApi.delete(deviceId);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (field: keyof DeviceInput, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const deviceUrl = typeof window !== 'undefined' ? `${window.location.origin}/devices/${deviceId}` : '';

  if (loading) {
    return (
      <AuthProtected>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading device...</p>
          </div>
        </div>
      </AuthProtected>
    );
  }

  if (!device) {
    return (
      <AuthProtected>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg font-semibold">Device not found</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </AuthProtected>
    );
  }

  return (
    <AuthProtected>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowQRDialog(true)}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{device.device_model}</CardTitle>
                  <CardDescription>Serial: {device.serial_number}</CardDescription>
                </div>
                <Badge style={{ backgroundColor: device.color_tag }} className="text-white">
                  {device.color_tag}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="device_model">Device Model</Label>
                      <Input
                        id="device_model"
                        value={formData.device_model || ''}
                        onChange={(e) => handleChange('device_model', e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serial_number">Serial Number</Label>
                      <Input
                        id="serial_number"
                        value={formData.serial_number || ''}
                        onChange={(e) => handleChange('serial_number', e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner_name">Owner Name</Label>
                      <Input
                        id="owner_name"
                        value={formData.owner_name || ''}
                        onChange={(e) => handleChange('owner_name', e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workbook">Workbook</Label>
                      <Input
                        id="workbook"
                        value={formData.workbook || ''}
                        onChange={(e) => handleChange('workbook', e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_enrolled">Date Enrolled</Label>
                      <Input
                        id="date_enrolled"
                        type="date"
                        value={formData.date_enrolled || ''}
                        onChange={(e) => handleChange('date_enrolled', e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="next_maintenance">Next Maintenance</Label>
                      <Input
                        id="next_maintenance"
                        type="date"
                        value={formData.next_maintenance || ''}
                        onChange={(e) => handleChange('next_maintenance', e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color_tag">Color Tag</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color_tag"
                          type="color"
                          value={formData.color_tag || '#000000'}
                          onChange={(e) => handleChange('color_tag', e.target.value)}
                          disabled={saving}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.color_tag || ''}
                          onChange={(e) => handleChange('color_tag', e.target.value)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      disabled={saving}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(device);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Owner</Label>
                      <p className="font-medium">{device.owner_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p className="font-medium">{device.category}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="font-medium">{device.location}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Workbook</Label>
                      <p className="font-medium">{device.workbook}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date Enrolled</Label>
                      <p className="font-medium">{new Date(device.date_enrolled).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Next Maintenance</Label>
                      <p className="font-medium">{new Date(device.next_maintenance).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {device.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="mt-1">{device.notes}</p>
                    </div>
                  )}

                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    Edit Device
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{device.device_model}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Device QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-4">
            <QRCodeSVG value={deviceUrl} size={256} level="H" />
            <p className="text-sm text-muted-foreground text-center">
              Scan to view device details
            </p>
            <p className="text-xs text-muted-foreground break-all text-center">
              {deviceUrl}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AuthProtected>
  );
}
