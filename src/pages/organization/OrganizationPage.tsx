import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Globe, 
  Edit, 
  Save,
  X,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '@/services/organizationService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { getOrganisationId } from '@/lib/shift-utils';
import { authToken } from '@/services/authToken';

interface OrganizationData {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  plan?: string;
  active_modules?: string[];
  total_employees?: number;
  total_departments?: number;
  created_at?: string;
  time_zone?: string;
  time_zone_offset?: string;
  // Fields not available from API (for UI display only)
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pin_code?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export default function OrganizationPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Get organisation_id from user, with multiple fallbacks
  const organisationId = useMemo(() => {
    const fromUser = user?.organisation_id;
    const fromStorage = getOrganisationId();
    const fromAuthToken = authToken.getorganisationId();
    
    // Try all sources in order of preference
    const orgId = fromUser || fromStorage || fromAuthToken || '';
    
    // Debug logging to help identify the issue
    if (!orgId) {
      console.warn('⚠️ No organisation_id found:', {
        hasUser: !!user,
        userOrganisationId: fromUser,
        fromStorage,
        fromAuthToken,
        userObject: user
      });
    } else {
      console.log('✅ Organisation ID found:', orgId, { 
        fromUser: !!fromUser, 
        fromStorage: !!fromStorage,
        fromAuthToken: !!fromAuthToken
      });
    }
    
    return orgId;
  }, [user]);

  // Fetch organization data with included relations
  const { data: orgResponse, isLoading: orgLoading, error: orgError, refetch: refetchOrg } = useQuery({
    queryKey: ['organization', 'current', organisationId],
    queryFn: async () => {
      if (!organisationId) {
        throw new Error('No organization ID found');
      }
      return organizationService.getOrganization(organisationId, {
        employees: true,
        departments: true,
        designations: true,
        admin: true
      });
    },
    enabled: !!organisationId && !authLoading,
  });

  const orgData = orgResponse?.data;
  // Get counts from included relations or fallback to 0
  const totalEmployees = orgData?.employees?.length || 0;
  const totalDepartments = orgData?.departments?.length || 0;

  // Transform API data to OrganizationData format
  const organization: OrganizationData = {
    id: orgData?.id || '',
    name: orgData?.name || 'Loading...',
    plan: orgData?.plan || 'N/A',
    code: orgData?.code || undefined,
    description: orgData?.description || undefined,
    active_modules: orgData?.active_modules || [],
    created_at: orgData?.created_at,
    total_employees: totalEmployees,
    total_departments: totalDepartments,
    time_zone: orgData?.time_zone,
    time_zone_offset: orgData?.time_zone_offset,
    // These fields are not available from API, will show as empty/placeholder
    address: undefined,
    city: undefined,
    state: undefined,
    country: undefined,
    pin_code: undefined,
    phone: undefined,
    email: undefined,
    website: undefined,
  };

  const [editForm, setEditForm] = useState<OrganizationData>(organization);

  // Update editForm when organization data changes
  useEffect(() => {
    if (orgData) {
      setEditForm({
        id: orgData.id || '',
        name: orgData.name || '',
        code: orgData.code || undefined,
        description: orgData.description || undefined,
        plan: orgData.plan,
        active_modules: orgData.active_modules || [],
        total_employees: totalEmployees,
        total_departments: totalDepartments,
        created_at: orgData.created_at,
        time_zone: orgData.time_zone,
        time_zone_offset: orgData.time_zone_offset,
      });
    }
  }, [orgData?.id, orgData?.name, orgData?.code, orgData?.description, orgData?.plan, orgData?.active_modules, orgData?.created_at, orgData?.time_zone, orgData?.time_zone_offset, totalEmployees, totalDepartments]);

  const handleEdit = () => {
    setEditForm(organization);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!orgData?.id) {
        toast({
          title: 'Error',
          description: 'Organization ID not found',
          variant: 'destructive',
        });
        return;
      }

      // Only update fields that are available in the API
      await organizationService.updateOrganization({
        id: orgData.id,
        name: editForm.name,
        plan: editForm.plan,
        code: editForm.code || null,
        description: editForm.description || null,
        active_modules: editForm.active_modules,
      });

      setIsEditing(false);
      refetchOrg();
      toast({
        title: 'Success',
        description: 'Organization details updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update organization details',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditForm(organization);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof OrganizationData, value: string | string[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getPlanColor = (plan?: string) => {
    if (!plan) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    switch (plan.toLowerCase()) {
      case 'premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'pro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'free': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (authLoading || orgLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!organisationId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Please select an organization to view organization details
        </p>
        <p className="text-sm text-muted-foreground">
          No organization ID found. Please login again or select an organization.
        </p>
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-2">
          Error loading organization: {orgError instanceof Error ? orgError.message : 'Unknown error'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Organisation ID: {organisationId}
        </p>
        <Button onClick={() => refetchOrg()} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">No organization data found</p>
        <p className="text-sm text-muted-foreground mb-4">
          Organisation ID: {organisationId}
        </p>
        <Button onClick={() => refetchOrg()} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        {!isEditing && (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Details
          </Button>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organization.total_employees || 0}</div>
                <p className="text-xs text-muted-foreground">Active employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organization.total_departments || 0}</div>
                <p className="text-xs text-muted-foreground">Active departments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={getPlanColor(organization.plan)}>
                  {organization.plan || 'N/A'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Active subscription</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Organization Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Organization Name</Label>
                  <p className="text-lg font-semibold mt-1">{organization.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Organization Code</Label>
                  <p className="text-lg font-semibold mt-1">
                    {organization.code || <span className="text-muted-foreground italic">Not set</span>}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-lg font-semibold mt-1">
                    {organization.created_at 
                      ? format(new Date(organization.created_at), 'MMMM dd, yyyy') 
                      : <span className="text-muted-foreground italic">Not available</span>}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time Zone</Label>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {organization.time_zone || <span className="text-muted-foreground italic">Not set</span>}
                    {organization.time_zone_offset && ` (${organization.time_zone_offset})`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {organization.description || <span className="text-muted-foreground italic">Not available</span>}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Website</Label>
                  <p className="text-blue-600 dark:text-blue-400 mt-1">
                    {organization.website || <span className="text-muted-foreground italic">Not available</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Address Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Organization Name *</Label>
                      <Input
                        id="name"
                        value={editForm.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Organization Code</Label>
                      <Input
                        id="code"
                        value={editForm.code || ''}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        placeholder="e.g., ORG001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan">Plan</Label>
                      <Input
                        id="plan"
                        value={editForm.plan || ''}
                        onChange={(e) => handleInputChange('plan', e.target.value)}
                        placeholder="e.g., Premium, Pro, Basic, Free"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editForm.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      placeholder="Enter organization description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="active_modules">Active Modules (comma-separated)</Label>
                    <Input
                      id="active_modules"
                      value={editForm.active_modules?.join(', ') || ''}
                      onChange={(e) => handleInputChange('active_modules', e.target.value.split(',').map(m => m.trim()).filter(m => m))}
                      placeholder="e.g., ATTENDANCE, LEAVE, PAYROLL, HR"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Current modules: {editForm.active_modules?.join(', ') || 'None'}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> Contact information (email, phone, address) and website are not available in the current API. 
                      These fields cannot be edited at this time.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Organization Name</Label>
                      <p className="text-lg font-semibold mt-1">{organization.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Organization Code</Label>
                      <p className="text-lg font-semibold mt-1">
                        {organization.code || <span className="text-muted-foreground italic">Not set</span>}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {organization.description || <span className="text-muted-foreground italic">Not available</span>}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Time Zone</Label>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {organization.time_zone || <span className="text-muted-foreground italic">Not set</span>}
                        {organization.time_zone_offset && ` (${organization.time_zone_offset})`}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Info:</strong> Contact information (email, phone, address) and website are not currently stored in the organization profile. 
                      These fields will be available once the backend API supports them.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Modules</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                These are the modules currently available in your {organization.plan} plan
              </p>
            </CardHeader>
            <CardContent>
              {organization.active_modules && organization.active_modules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organization.active_modules.map((module) => (
                    <div key={module} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium capitalize">{module.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active modules found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold">Current Plan: {organization.plan || 'N/A'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {organization.created_at 
                      ? `Active since ${format(new Date(organization.created_at), 'MMMM dd, yyyy')}`
                      : 'Active'}
                  </p>
                </div>
                <Badge className={getPlanColor(organization.plan)}>
                  Active
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Plan Features</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• {organization.total_employees || 0} employees</li>
                    <li>• {organization.active_modules?.length || 0} active modules</li>
                    <li>• Priority support</li>
                    <li>• Advanced analytics</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Next Billing</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your next billing cycle will be on the same date next month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 