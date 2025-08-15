import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Settings, 
  Edit, 
  Trash2, 
  RefreshCw,
  Search,
  Calendar,
  Clock,
  Shield,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { leaveService, Leave } from '@/services/leaveService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

export default function LeaveTypesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // API calls
  const { data: leaveTypesResponse, isLoading, refetch } = useQuery({
    queryKey: ['leave', 'types'],
    queryFn: () => leaveService.getLeaveTypes({ page: 1, page_size: 100 }),
    enabled: true,
  });

  const leaveTypes = leaveTypesResponse?.data || [];

  const filteredLeaveTypes = leaveTypes.filter(type =>
    type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Success",
        description: "Leave types refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh leave types",
        variant: "destructive",
      });
    }
  };

  const handleAddLeaveType = () => {
    setShowAddForm(true);
    // TODO: Implement add leave type form
  };

  const handleEditLeaveType = (type: Leave) => {
    // TODO: Implement edit leave type form
    console.log('Edit:', type);
  };

  const handleDeleteLeaveType = async (type: Leave) => {
    if (confirm(`Are you sure you want to delete "${type.name}"?`)) {
      try {
        // TODO: Implement delete leave type API call
        toast({
          title: "Success",
          description: "Leave type deleted successfully",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete leave type",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leave Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage leave types and configurations
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddLeaveType}>
            <Plus className="h-4 w-4 mr-2" />
            Add Leave Type
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Search:</span>
            </div>
            
            <div className="relative">
              <Input
                placeholder="Search leave types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredLeaveTypes.length} of {leaveTypes.length} leave types
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeaveTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {type.code}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {type.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Leave Type Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    Initial Balance:
                  </span>
                  <span className="font-medium">{type.initial_balance || 0} days</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    Max Balance:
                  </span>
                  <span className="font-medium">
                    {type.max_balance ? `${type.max_balance} days` : 'Unlimited'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Shield className="h-4 w-4" />
                    Requires Approval:
                  </span>
                  <Badge variant={type.requires_approval ? "default" : "secondary"}>
                    {type.requires_approval ? 'Yes' : 'No'}
                  </Badge>
                </div>

                {type.color && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Color:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-xs text-gray-500">{type.color}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditLeaveType(type)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteLeaveType(type)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLeaveTypes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Settings className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {searchTerm ? 'No leave types found' : 'No leave types configured'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first leave type'
                  }
                </p>
              </div>
              {!searchTerm && (
                <Button onClick={handleAddLeaveType}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Leave Type
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Leave Type Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Leave Type</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input placeholder="e.g., Annual Leave" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Code</label>
                <Input placeholder="e.g., AL" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input placeholder="Description of the leave type" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Initial Balance</label>
                  <Input type="number" placeholder="0" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Max Balance</label>
                  <Input type="number" placeholder="Unlimited" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="requires-approval" />
                <label htmlFor="requires-approval" className="text-sm">
                  Requires approval
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button>
                Add Leave Type
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
