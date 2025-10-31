"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { devicesApi, workbooksApi, authApi, Device, Workbook, DevicesQueryParams } from '@/lib/api';
import AuthProtected from '@/components/AuthProtected';
import DeviceTable from '@/components/DeviceTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, LogOut, Download, Upload, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DevicesQueryParams>({
    limit: 50,
    offset: 0,
  });
  const [total, setTotal] = useState(0);

  const fetchDevices = async () => {
    try {
      const params: DevicesQueryParams = {
        ...filters,
        q: searchQuery || undefined,
      };
      const response = await devicesApi.list(params);
      setDevices(response.devices);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkbooks = async () => {
    try {
      const response = await workbooksApi.list();
      setWorkbooks(response.workbooks);
    } catch (error) {
      console.error('Failed to fetch workbooks:', error);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchWorkbooks();
  }, [filters]);

  const handleSearch = () => {
    setFilters({ ...filters, offset: 0 });
    fetchDevices();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await devicesApi.export();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devices-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;
  const totalPages = Math.ceil(total / (filters.limit || 50));

  const handlePrevPage = () => {
    setFilters({
      ...filters,
      offset: Math.max(0, (filters.offset || 0) - (filters.limit || 50)),
    });
  };

  const handleNextPage = () => {
    setFilters({
      ...filters,
      offset: (filters.offset || 0) + (filters.limit || 50),
    });
  };

  return (
    <AuthProtected>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Charterhouse Lagos IT</h1>
                <p className="text-sm text-muted-foreground">Device Inventory Management</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/devices/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Device
              </Button>
              <Button variant="outline" onClick={() => router.push('/import')}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => router.push('/workbooks')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Workbooks
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              value={filters.workbook || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, workbook: value === 'all' ? undefined : value, offset: 0 })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Workbooks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workbooks</SelectItem>
                {workbooks.map((wb) => (
                  <SelectItem key={wb.id} value={wb.name}>
                    {wb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.location || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, location: value === 'all' ? undefined : value, offset: 0 })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Lagos Office">Lagos Office</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value === 'all' ? undefined : value, offset: 0 })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Desktop">Desktop</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="Accessory">Accessory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Legend */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Color Tag Legend:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground">Color tags help identify device categories or status at a glance</span>
            </div>
          </div>

          {/* Device Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-4 text-muted-foreground">Loading devices...</p>
              </div>
            </div>
          ) : (
            <>
              <DeviceTable devices={devices} onRefresh={fetchDevices} />

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {devices.length} of {total} devices
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthProtected>
  );
}