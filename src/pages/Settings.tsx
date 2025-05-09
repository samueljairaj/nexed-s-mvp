
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { LogOut, Info, Bell, Shield, FolderClosed, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // User preferences state
  const [settings, setSettings] = useState({
    emailReminders: true,
    pushNotifications: false,
    reminderWindow: "14",
    documentVersionTracking: true,
    expirationReminders: true,
    defaultCategory: "Personal",
    language: "English",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    // In a real application, we would save this to Supabase
    // For now just show a toast notification
    toast.success(`Setting updated: ${key}`);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(`Failed to update password: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real application, we would implement account deletion
    // This is a placeholder for now
    toast.error("Account deletion is not implemented in this demo");
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FolderClosed className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="language">
            <Globe className="mr-2 h-4 w-4" />
            Language
          </TabsTrigger>
          <TabsTrigger value="info">
            <Info className="mr-2 h-4 w-4" />
            Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-reminders" className="font-medium">Email Reminders</Label>
                  <p className="text-sm text-gray-500">Receive deadline reminders via email</p>
                </div>
                <Switch
                  id="email-reminders"
                  checked={settings.emailReminders}
                  onCheckedChange={(checked) => handleSettingChange("emailReminders", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Enable browser push notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-window" className="font-medium">Pre-reminder Window</Label>
                <p className="text-sm text-gray-500">How many days before a deadline to send reminders</p>
                <Select
                  value={settings.reminderWindow}
                  onValueChange={(value) => handleSettingChange("reminderWindow", value)}
                >
                  <SelectTrigger id="reminder-window" className="w-full max-w-xs">
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Change Password"}
                </Button>
              </form>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor" className="font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Additional security for your account</p>
                  </div>
                  <Switch
                    id="two-factor"
                    disabled
                    onCheckedChange={(checked) => handleSettingChange("twoFactor", checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your 
                        account and remove all your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Vault Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="version-tracking" className="font-medium">Document Version Tracking</Label>
                  <p className="text-sm text-gray-500">Keep track of document revisions</p>
                </div>
                <Switch
                  id="version-tracking"
                  checked={settings.documentVersionTracking}
                  onCheckedChange={(checked) => handleSettingChange("documentVersionTracking", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="expiration-reminders" className="font-medium">Expiration Reminders</Label>
                  <p className="text-sm text-gray-500">Get notified about documents expiring soon</p>
                </div>
                <Switch
                  id="expiration-reminders"
                  checked={settings.expirationReminders}
                  onCheckedChange={(checked) => handleSettingChange("expirationReminders", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-category" className="font-medium">Default Document Category</Label>
                <p className="text-sm text-gray-500">Category assigned to new uploads</p>
                <Select
                  value={settings.defaultCategory}
                  onValueChange={(value) => handleSettingChange("defaultCategory", value)}
                >
                  <SelectTrigger id="default-category" className="w-full max-w-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Immigration">Immigration</SelectItem>
                    <SelectItem value="Employment">Employment</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Language & Timezone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="app-language" className="font-medium">App Language</Label>
                <Select 
                  value={settings.language}
                  onValueChange={(value) => handleSettingChange("language", value)}
                >
                  <SelectTrigger id="app-language" className="w-full max-w-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish" disabled>Spanish (Coming soon)</SelectItem>
                    <SelectItem value="Chinese" disabled>Chinese (Coming soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone" className="font-medium">Timezone</Label>
                <p className="text-sm text-gray-500">Current: {settings.timezone}</p>
                <Button
                  variant="outline"
                  onClick={() => handleSettingChange("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)}
                >
                  Auto-detect Timezone
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>App Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Legal</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="link" className="justify-start p-0 h-auto">
                    Terms of Use
                  </Button>
                  <Button variant="link" className="justify-start p-0 h-auto">
                    Privacy Policy
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Support</h3>
                <Button variant="link" className="justify-start p-0 h-auto">
                  Contact Support
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
              
              <div className="text-center text-xs text-gray-400 mt-6">
                <p>neXed v1.0.0</p>
                <p>© 2025 neXed. All rights reserved.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
