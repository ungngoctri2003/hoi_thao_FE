"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function AuthDebug() {
  const { user, isAuthenticated, isLoading, refreshPermissions } = useAuth();

  const handleRefreshPermissions = async () => {
    try {
      await refreshPermissions();
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Authentication Debug
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshPermissions}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Permissions
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>isAuthenticated:</strong>
              <Badge variant={isAuthenticated ? "default" : "destructive"} className="ml-2">
                {isAuthenticated ? "True" : "False"}
              </Badge>
            </div>
            <div>
              <strong>isLoading:</strong>
              <Badge variant={isLoading ? "default" : "secondary"} className="ml-2">
                {isLoading ? "True" : "False"}
              </Badge>
            </div>
          </div>

          {user ? (
            <div className="space-y-2">
              <div><strong>User ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Role:</strong> 
                <Badge variant="outline" className="ml-2">{user.role}</Badge>
              </div>
              <div><strong>Avatar:</strong> {user.avatar || "None"}</div>
              <div>
                <strong>Permissions:</strong>
                <div className="mt-2 flex flex-wrap gap-1">
                  {user.permissions && user.permissions.length > 0 ? (
                    user.permissions.map((permission, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="destructive">No permissions</Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">No user data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
