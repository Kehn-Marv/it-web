"use client";

import { useState } from 'react';
import { Device, devicesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeviceTableProps {
  devices: Device[];
  onRefresh: () => void;
}

export default function DeviceTable({ devices, onRefresh }: DeviceTableProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Device>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (device: Device) => {
    setEditingId(device.id);
    setEditData({ ...device });
  };

  const handleSave = async (id: number) => {
    try {
      await devicesApi.update(id, editData);
      setEditingId(null);
      setEditData({});
      onRefresh();
    } catch (error) {
      console.error('Failed to update device:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await devicesApi.delete(deleteId);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete device:', error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all([...selected].map(id => devicesApi.delete(id)));
      setSelected(new Set());
      onRefresh();
    } catch (error) {
      console.error('Failed to delete devices:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === devices.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(devices.map(d => d.id)));
    }
  };

  const isEditing = (id: number) => editingId === id;

  return (
    <>
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-4 bg-muted p-4 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selected.size === devices.length && devices.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Serial</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Next Maintenance</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Color Tag</TableHead>
              <TableHead>Workbook</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(device.id)}
                    onCheckedChange={() => toggleSelect(device.id)}
                  />
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      value={editData.device_model || ''}
                      onChange={(e) => setEditData({ ...editData, device_model: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    device.device_model
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      value={editData.serial_number || ''}
                      onChange={(e) => setEditData({ ...editData, serial_number: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    device.serial_number
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      value={editData.owner_name || ''}
                      onChange={(e) => setEditData({ ...editData, owner_name: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    device.owner_name
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      type="date"
                      value={editData.date_enrolled || ''}
                      onChange={(e) => setEditData({ ...editData, date_enrolled: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    new Date(device.date_enrolled).toLocaleDateString()
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      type="date"
                      value={editData.next_maintenance || ''}
                      onChange={(e) => setEditData({ ...editData, next_maintenance: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    new Date(device.next_maintenance).toLocaleDateString()
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    device.location
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      value={editData.category || ''}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    device.category
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      type="color"
                      value={editData.color_tag || '#000000'}
                      onChange={(e) => setEditData({ ...editData, color_tag: e.target.value })}
                      className="h-8 w-16"
                    />
                  ) : (
                    <Badge style={{ backgroundColor: device.color_tag }} className="text-white">
                      {device.color_tag}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <Input
                      value={editData.workbook || ''}
                      onChange={(e) => setEditData({ ...editData, workbook: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    device.workbook
                  )}
                </TableCell>
                <TableCell>
                  {isEditing(device.id) ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleSave(device.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(device)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(device.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/devices/${device.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.has(device.id)}
                    onCheckedChange={() => toggleSelect(device.id)}
                  />
                  <h3 className="font-semibold">{device.device_model}</h3>
                </div>
                <Badge style={{ backgroundColor: device.color_tag }} className="text-white">
                  {device.color_tag}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Serial:</span> {device.serial_number}</div>
                <div><span className="font-medium">Owner:</span> {device.owner_name}</div>
                <div><span className="font-medium">Location:</span> {device.location}</div>
                <div><span className="font-medium">Category:</span> {device.category}</div>
                <div><span className="font-medium">Workbook:</span> {device.workbook}</div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => router.push(`/devices/${device.id}`)}>
                  View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(device)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(device.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
