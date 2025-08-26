/**
 * Smart Compliance Demo Component
 * 
 * Demonstrates the smart compliance system with real-time task generation,
 * intelligent guidance, and enhanced user experience features.
 */

import React, { useState } from 'react';
import { useSmartCompliance } from '@/hooks/useSmartCompliance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Brain, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Zap,
  Shield,
  Target
} from 'lucide-react';

/**
 * Smart Compliance Demo Component
 */
export const SmartComplianceDemo: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  
  const {
    tasks,
    isLoading,
    isGenerating,
    lastGeneratedAt,
    source,
    generateSmartTasks,
    refreshTasks,
    clearCache,
    getTasksByPhase,
    getUrgentTasks,
    getOverdueTasks,
    getTaskStats,
    serviceHealth,
    performance,
    errors
  } = useSmartCompliance({
    enableAutoRefresh: true,
    refreshIntervalMinutes: 30,
    enableNotifications: true,
    debugMode: true
  });

  const stats = getTaskStats();
  const urgentTasks = getUrgentTasks();
  const overdueTasks = getOverdueTasks();

  const getDisplayTasks = () => {
    if (selectedPhase === 'all') return tasks;
    if (selectedPhase === 'urgent') return urgentTasks;
    if (selectedPhase === 'overdue') return overdueTasks;
    return getTasksByPhase(selectedPhase);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getServiceHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧠 Smart Compliance System</h1>
          <p className="text-muted-foreground">
            Intelligent, personalized compliance guidance powered by advanced rule engine
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generateSmartTasks}
            disabled={isGenerating}
            variant="outline"
          >
            <Brain className="h-4 w-4 mr-2" />
            Generate Tasks
          </Button>
          <Button
            onClick={refreshTasks}
            disabled={isGenerating}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={clearCache}
            variant="outline"
            size="sm"
          >
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Service Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${getServiceHealthColor(serviceHealth.status)}`} />
              <span className="text-sm">System Health</span>
            </div>
            <Badge variant={serviceHealth.status === 'healthy' ? 'default' : 'destructive'}>
              {serviceHealth.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Rule Engine</span>
              <Badge variant={serviceHealth.ruleEngineAvailable ? 'default' : 'secondary'}>
                {serviceHealth.ruleEngineAvailable ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Source</span>
              <Badge variant="outline">{source || 'None'}</Badge>
            </div>
          </div>

          {lastGeneratedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last updated: {lastGeneratedAt.toLocaleTimeString()}
            </div>
          )}

          {performance && (
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>Execution: {performance.executionTimeMs}ms</div>
              <div>Rules: {performance.rulesEvaluated}</div>
              <div>Matches: {performance.rulesMatched}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.urgent}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compliance Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
              </div>
              <Progress value={(stats.completed / stats.total) * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Views */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Smart Compliance Tasks</CardTitle>
              <CardDescription>
                Personalized tasks generated by intelligent rule engine
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">AI-Powered</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPhase} onValueChange={setSelectedPhase}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="urgent">Urgent ({stats.urgent})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
              <TabsTrigger value="during_program">Active</TabsTrigger>
              <TabsTrigger value="pre_graduation">Pre-Grad</TabsTrigger>
              <TabsTrigger value="opt_active">OPT</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedPhase} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading intelligent tasks...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {getDisplayTasks().length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks found for this filter</p>
                      <Button
                        onClick={generateSmartTasks}
                        variant="outline"
                        className="mt-4"
                      >
                        Generate Smart Tasks
                      </Button>
                    </div>
                  ) : (
                    getDisplayTasks().map((task) => (
                      <Card key={task.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{task.title}</h3>
                                <Badge variant={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                                {task.phase && (
                                  <Badge variant="outline">{task.phase}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {task.description}
                              </p>
                              {task.deadline && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Due: {task.deadline.toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <div className="h-5 w-5 border-2 border-gray-300 rounded" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Phase Distribution */}
      {Object.keys(stats.byPhase).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tasks by Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.byPhase).map(([phase, count]) => (
                <div key={phase} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{phase.replace('_', ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
