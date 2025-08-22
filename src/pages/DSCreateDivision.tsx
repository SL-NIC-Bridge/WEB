import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, List } from 'lucide-react';

interface Division {
  id: string;
  number: string;
  name: string;
  createdAt: string;
}

const DSCreateDivision = () => {
  const [divisionNumber, setDivisionNumber] = useState('');
  const [divisionName, setDivisionName] = useState('');
  const [divisions, setDivisions] = useState<Division[]>(() => {
    const saved = localStorage.getItem('gnDivisions');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!divisionNumber.trim() || !divisionName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if division number already exists
    if (divisions.some(div => div.number === divisionNumber.trim())) {
      toast.error('Division number already exists');
      return;
    }

    const newDivision: Division = {
      id: Date.now().toString(),
      number: divisionNumber.trim(),
      name: divisionName.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedDivisions = [...divisions, newDivision];
    setDivisions(updatedDivisions);
    localStorage.setItem('gnDivisions', JSON.stringify(updatedDivisions));

    toast.success('GN Division created successfully');
    setDivisionNumber('');
    setDivisionName('');
  };

  const handleDelete = (id: string) => {
    const updatedDivisions = divisions.filter(div => div.id !== id);
    setDivisions(updatedDivisions);
    localStorage.setItem('gnDivisions', JSON.stringify(updatedDivisions));
    toast.success('Division deleted successfully');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">GN Division Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage Grama Niladhari divisions (Wasama)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Division Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Division
              </CardTitle>
              <CardDescription>
                Add a new GN Division with number and name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="divisionNumber">Division Number</Label>
                  <Input
                    id="divisionNumber"
                    type="text"
                    placeholder="e.g., 001, 002, 003"
                    value={divisionNumber}
                    onChange={(e) => setDivisionNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="divisionName">Division Name</Label>
                  <Input
                    id="divisionName"
                    type="text"
                    placeholder="Enter division name"
                    value={divisionName}
                    onChange={(e) => setDivisionName(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Division
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Divisions List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Existing Divisions
              </CardTitle>
              <CardDescription>
                {divisions.length} division{divisions.length !== 1 ? 's' : ''} created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {divisions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No divisions created yet
                  </p>
                ) : (
                  divisions.map((division) => (
                    <div key={division.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">
                          Division {division.number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {division.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(division.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(division.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DSCreateDivision;