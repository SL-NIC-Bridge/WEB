// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// import { toast } from 'sonner';
// import { Plus, List, Edit, Trash2 } from 'lucide-react';
// import { divisionApiService } from '@/services/apiServices';
// import { GnDivision } from '@/types';

// const DSCreateDivision = () => {
//   const [divisionNumber, setDivisionNumber] = useState('');
//   const [divisionName, setDivisionName] = useState('');
//   const [editingDivision, setEditingDivision] = useState<GnDivision | null>(null);
//   const [divisions, setDivisions] = useState<GnDivision[]>(() => {
//     const saved = localStorage.getItem('gnDivisions');
//     return saved ? JSON.parse(saved) : [];
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!divisionNumber.trim() || !divisionName.trim()) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     if (editingDivision) {
//       // Check if division number already exists (excluding current editing division)
//       if (divisions.some(div => div.code === divisionNumber.trim() && div.id !== editingDivision.id)) {
//         toast.error('Division number already exists');
//         return;
//       }

//       const updatedDivisions = divisions.map(div =>
//         div.id === editingDivision.id
//           ? { ...div, number: divisionNumber.trim(), name: divisionName.trim() }
//           : div
//       );
//       setDivisions(updatedDivisions);
//       localStorage.setItem('gnDivisions', JSON.stringify(updatedDivisions));
//       toast.success('Division updated successfully');
//       setEditingDivision(null);
//     } else {
//       // Check if division number already exists
//       // if (divisions.some(div => div.code === divisionNumber.trim())) {
//       //   toast.error('Division number already exists');
//       //   return;
//       // }

//       const newDivision = {
        
//         code: divisionNumber.trim(),
//         name: divisionName.trim()
//       };
//       divisionApiService.createGnDivision(newDivision).then((createdDivision) => {
//         const updatedDivisions = [...divisions, createdDivision];
//         setDivisions(updatedDivisions);
//         localStorage.setItem('gnDivisions', JSON.stringify(updatedDivisions));
//         toast.success('GN Division created successfully');
//       }).catch(() => {
//         toast.error('Failed to create GN Division');
//       });

//       // const updatedDivisions = [...divisions, newDivision];
//       // setDivisions(updatedDivisions);
//       // localStorage.setItem('gnDivisions', JSON.stringify(updatedDivisions));
//       // toast.success('GN Division created successfully');
//     }

//     setDivisionNumber('');
//     setDivisionName('');
//   };

//   const handleEdit = (division: GnDivision) => {
//     setEditingDivision(division);
//     setDivisionNumber(division.code);
//     setDivisionName(division.name);
//   };

//   const handleCancelEdit = () => {
//     setEditingDivision(null);
//     setDivisionNumber('');
//     setDivisionName('');
//   };

//   const handleDelete = (id: string) => {
//     const updatedDivisions = divisions.filter(div => div.id !== id);
//     setDivisions(updatedDivisions);
//     localStorage.setItem('gnDivisions', JSON.stringify(updatedDivisions));
//     toast.success('Division deleted successfully');
//   };

//   useEffect(() => {
//     // Load divisions from localStorage on mount
//      divisionApiService.getGnDivisions().then(response => {
//        setDivisions(response.data)
//       }).catch(() => {
//         toast.error('Failed to load divisions');
//       }
//     );
    
//   }, []);

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground">GN Division Management</h1>
//           <p className="text-muted-foreground mt-2">Create and manage Grama Niladhari divisions (GnDivision)</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Create Division Form */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 {editingDivision ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
//                 {editingDivision ? 'Edit Division' : 'Create New Division'}
//               </CardTitle>
//               <CardDescription>
//                 {editingDivision ? 'Update the division details' : 'Add a new GN Division with number and name'}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="divisionNumber">Division Number</Label>
//                   <Input
//                     id="divisionNumber"
//                     type="text"
//                     placeholder="e.g., 001, 002, 003"
//                     value={divisionNumber}
//                     onChange={(e) => setDivisionNumber(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="divisionName">Division Name</Label>
//                   <Input
//                     id="divisionName"
//                     type="text"
//                     placeholder="Enter division name"
//                     value={divisionName}
//                     onChange={(e) => setDivisionName(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="flex gap-2">
//                   <Button type="submit" className="flex-1">
//                     {editingDivision ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
//                     {editingDivision ? 'Update Division' : 'Create Division'}
//                   </Button>
//                   {editingDivision && (
//                     <Button type="button" variant="outline" onClick={handleCancelEdit}>
//                       Cancel
//                     </Button>
//                   )}
//                 </div>
//               </form>
//             </CardContent>
//           </Card>

//           {/* Divisions List */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <List className="w-5 h-5" />
//                 Existing Divisions
//               </CardTitle>
//               <CardDescription>
//                 {divisions.length} division{divisions.length !== 1 ? 's' : ''} created
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4 max-h-96 overflow-y-auto">
//                 {divisions.length === 0 ? (
//                   <p className="text-muted-foreground text-center py-8">
//                     No divisions created yet
//                   </p>
//                 ) : (
//                   divisions.map((division) => (
//                     <div key={division.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
//                       <div>
//                         <div className="font-medium text-foreground">
//                           Division {division.code}
//                         </div>
//                         <div className="text-sm text-muted-foreground">
//                           {division.name}
//                         </div>
//                         <div className="text-xs text-muted-foreground">
//                           Created: {new Date(division.createdAt).toLocaleDateString()}
//                         </div>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleEdit(division)}
//                         >
//                           <Edit className="w-4 h-4 mr-1" />
//                           Edit
//                         </Button>
//                         <AlertDialog>
//                           <AlertDialogTrigger asChild>
//                             <Button
//                               variant="destructive"
//                               size="sm"
//                             >
//                               <Trash2 className="w-4 h-4 mr-1" />
//                               Delete
//                             </Button>
//                           </AlertDialogTrigger>
//                           <AlertDialogContent>
//                             <AlertDialogHeader>
//                               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                               <AlertDialogDescription>
//                                 This action cannot be undone. This will permanently delete Division {division.code} - {division.name}.
//                               </AlertDialogDescription>
//                             </AlertDialogHeader>
//                             <AlertDialogFooter>
//                               <AlertDialogCancel>Cancel</AlertDialogCancel>
//                               <AlertDialogAction
//                                 onClick={() => handleDelete(division.id)}
//                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                               >
//                                 Delete
//                               </AlertDialogAction>
//                             </AlertDialogFooter>
//                           </AlertDialogContent>
//                         </AlertDialog>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DSCreateDivision;




import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, List, Edit, Trash2 } from 'lucide-react';
import { divisionApiService } from '@/services/apiServices';
import { GnDivision } from '@/types';

const DSCreateDivision = () => {
  const [divisionNumber, setDivisionNumber] = useState('');
  const [divisionName, setDivisionName] = useState('');
  const [editingDivision, setEditingDivision] = useState<GnDivision | null>(null);
  const [divisions, setDivisions] = useState<GnDivision[]>([]);

  // Fetch divisions from API
  const fetchDivisions = () => {
    divisionApiService
      .getGnDivisions()
      .then((response) => {
        setDivisions(response.data); // use API data
      })
      .catch(() => {
        toast.error('Failed to load divisions');
      });
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!divisionNumber.trim() || !divisionName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingDivision) {
      // --- Update Division ---
      divisionApiService
        .updateGnDivision(editingDivision.id, {
          code: divisionNumber.trim(),
          name: divisionName.trim(),
        })
        .then(() => {
          toast.success('Division updated successfully');
          setEditingDivision(null);
          setDivisionNumber('');
          setDivisionName('');
          fetchDivisions();
        })
        .catch(() => {
          toast.error('Failed to update division');
        });
    } else {
      // --- Create Division ---
      const newDivision = {
        code: divisionNumber.trim(),
        name: divisionName.trim(),
      };
      divisionApiService
        .createGnDivision(newDivision)
        .then(() => {
          toast.success('GN Division created successfully');
          setDivisionNumber('');
          setDivisionName('');
          fetchDivisions();
        })
        .catch(() => {
          toast.error('Failed to create GN Division');
        });
    }
  };

  const handleEdit = (division: GnDivision) => {
    setEditingDivision(division);
    setDivisionNumber(division.code);
    setDivisionName(division.name);
  };

  const handleCancelEdit = () => {
    setEditingDivision(null);
    setDivisionNumber('');
    setDivisionName('');
  };

  const handleDelete = (id: string) => {
    divisionApiService
      .deleteGnDivision(id)
      .then(() => {
        toast.success('Division deleted successfully');
        fetchDivisions();
      })
      .catch(() => {
        toast.error('Failed to delete division');
      });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">GN Division Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage Grama Niladhari divisions (GnDivision)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create/Update Division Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingDivision ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingDivision ? 'Edit Division' : 'Create New Division'}
              </CardTitle>
              <CardDescription>
                {editingDivision
                  ? 'Update the division details'
                  : 'Add a new GN Division with number and name'}
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

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingDivision ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {editingDivision ? 'Update Division' : 'Create Division'}
                  </Button>
                  {editingDivision && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Division List */}
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
                    <div
                      key={division.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          Division {division.code}
                        </div>
                        <div className="text-sm text-muted-foreground">{division.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(division.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(division)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete Division{' '}
                                {division.code} - {division.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(division.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
