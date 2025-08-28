/**
 * Dependency Resolver - Manages task dependencies and execution order
 * 
 * This class handles complex task dependencies, ensuring prerequisite tasks
 * are completed before dependent tasks become active, and prevents circular dependencies.
 */

import { GeneratedTask, RuleEngineError } from './types';

export class DependencyResolver {
  
  /**
   * Resolve task dependencies and return properly ordered tasks
   */
  public async resolveDependencies(tasks: GeneratedTask[]): Promise<GeneratedTask[]> {
    try {
      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(tasks);
      
      // Check for circular dependencies
      this.validateNoCycles(dependencyGraph);
      
      // Sort tasks by dependency order
      const sortedTasks = this.topologicalSort(tasks, dependencyGraph);
      
      // Update task states based on dependencies
      return this.updateTaskStates(sortedTasks, dependencyGraph);
      
    } catch (error) {
      throw new RuleEngineError(
        `Dependency resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DEPENDENCY_CYCLE_DETECTED'
      );
    }
  }

  /**
   * Build dependency graph from tasks
   */
  private buildDependencyGraph(tasks: GeneratedTask[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    const taskIds = new Set(tasks.map(task => task.ruleId));
    
    // Initialize graph
    for (const task of tasks) {
      graph.set(task.ruleId, new Set());
    }
    
    // Add dependencies
    for (const task of tasks) {
      if (task.dependencies && task.dependencies.length > 0) {
        const dependencies = new Set<string>();
        
        for (const depId of task.dependencies) {
          // Only add dependencies that exist in current task set
          if (taskIds.has(depId)) {
            dependencies.add(depId);
          }
        }
        
        graph.set(task.ruleId, dependencies);
      }
    }
    
    return graph;
  }

  /**
   * Validate that there are no circular dependencies
   */
  private validateNoCycles(graph: Map<string, Set<string>>): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        if (this.hasCycleDFS(node, graph, visited, recursionStack)) {
          throw new RuleEngineError(
            `Circular dependency detected involving task: ${node}`,
            'DEPENDENCY_CYCLE_DETECTED'
          );
        }
      }
    }
  }

  /**
   * Depth-first search to detect cycles
   */
  private hasCycleDFS(
    node: string,
    graph: Map<string, Set<string>>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(node);
    recursionStack.add(node);
    
    const dependencies = graph.get(node) || new Set();
    
    for (const dep of dependencies) {
      if (!visited.has(dep)) {
        if (this.hasCycleDFS(dep, graph, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(dep)) {
        return true;
      }
    }
    
    recursionStack.delete(node);
    return false;
  }

  /**
   * Topological sort to order tasks by dependencies
   */
  private topologicalSort(tasks: GeneratedTask[], graph: Map<string, Set<string>>): GeneratedTask[] {
    const inDegree = new Map<string, number>();
    const taskMap = new Map<string, GeneratedTask>();
    
    // Build task map and initialize in-degrees
    for (const task of tasks) {
      taskMap.set(task.ruleId, task);
      inDegree.set(task.ruleId, 0);
    }
    
    // Calculate in-degrees
    for (const [node, dependencies] of graph) {
      for (const dep of dependencies) {
        const currentInDegree = inDegree.get(node) || 0;
        inDegree.set(node, currentInDegree + 1);
      }
    }
    
    // Initialize queue with nodes having no dependencies
    const queue: string[] = [];
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node);
      }
    }
    
    const sortedTasks: GeneratedTask[] = [];
    
    // Process queue
    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      const task = taskMap.get(currentNode);
      
      if (task) {
        sortedTasks.push(task);
      }
      
      // Reduce in-degree of dependent nodes
      for (const [node, dependencies] of graph) {
        if (dependencies.has(currentNode)) {
          const newInDegree = (inDegree.get(node) || 1) - 1;
          inDegree.set(node, newInDegree);
          
          if (newInDegree === 0) {
            queue.push(node);
          }
        }
      }
    }
    
    // Check if all tasks were processed (no cycles)
    if (sortedTasks.length !== tasks.length) {
      throw new RuleEngineError(
        'Failed to resolve all dependencies - possible circular dependency',
        'DEPENDENCY_CYCLE_DETECTED'
      );
    }
    
    return sortedTasks;
  }

  /**
   * Update task states based on dependency completion
   */
  private updateTaskStates(tasks: GeneratedTask[], graph: Map<string, Set<string>>): GeneratedTask[] {
    const updatedTasks: GeneratedTask[] = [];
    const completedTasks = new Set<string>();
    
    for (const task of tasks) {
      const dependencies = graph.get(task.ruleId) || new Set();
      const updatedTask = { ...task };
      
      // Check if all dependencies are completed
      const allDependenciesCompleted = Array.from(dependencies).every(depId => 
        completedTasks.has(depId) || this.isTaskCompleted(depId, tasks)
      );
      
      if (dependencies.size === 0) {
        // No dependencies - task is immediately available
        updatedTask.phase = task.phase;
      } else if (allDependenciesCompleted) {
        // All dependencies completed - task is available
        updatedTask.phase = task.phase;
      } else {
        // Dependencies not completed - mark as blocked
        updatedTask.description = `${task.description}\n\n⚠️ This task is waiting for prerequisite tasks to be completed.`;
        updatedTask.priority = 'low'; // Lower priority for blocked tasks
        
        // Add dependency information
        const dependencyInfo = this.buildDependencyInfo(dependencies, tasks);
        if (dependencyInfo) {
          updatedTask.description += `\n\nPrerequisites: ${dependencyInfo}`;
        }
      }
      
      // Track completion for next iterations
      if (updatedTask.completed) {
        completedTasks.add(task.ruleId);
      }
      
      updatedTasks.push(updatedTask);
    }
    
    return updatedTasks;
  }

  /**
   * Check if a task is completed
   */
  private isTaskCompleted(taskId: string, tasks: GeneratedTask[]): boolean {
    const task = tasks.find(t => t.ruleId === taskId);
    return task?.completed || false;
  }

  /**
   * Build human-readable dependency information
   */
  private buildDependencyInfo(dependencies: Set<string>, tasks: GeneratedTask[]): string {
    const depNames: string[] = [];
    
    for (const depId of dependencies) {
      const depTask = tasks.find(t => t.ruleId === depId);
      if (depTask) {
        depNames.push(depTask.title);
      } else {
        depNames.push(depId);
      }
    }
    
    return depNames.join(', ');
  }

  /**
   * Get tasks that can be started immediately (no dependencies or all dependencies completed)
   */
  public getAvailableTasks(tasks: GeneratedTask[]): GeneratedTask[] {
    const graph = this.buildDependencyGraph(tasks);
    const completedTaskIds = new Set(tasks.filter(t => t.completed).map(t => t.ruleId));
    
    return tasks.filter(task => {
      const dependencies = graph.get(task.ruleId) || new Set();
      
      // No dependencies - immediately available
      if (dependencies.size === 0) {
        return true;
      }
      
      // All dependencies completed
      return Array.from(dependencies).every(depId => completedTaskIds.has(depId));
    });
  }

  /**
   * Get tasks that are blocked by dependencies
   */
  public getBlockedTasks(tasks: GeneratedTask[]): GeneratedTask[] {
    const availableTasks = new Set(this.getAvailableTasks(tasks).map(t => t.ruleId));
    return tasks.filter(task => !availableTasks.has(task.ruleId) && !task.completed);
  }

  /**
   * Get dependency chain for a specific task
   */
  public getDependencyChain(taskId: string, tasks: GeneratedTask[]): string[] {
    const graph = this.buildDependencyGraph(tasks);
    const chain: string[] = [];
    const visited = new Set<string>();
    
    this.buildDependencyChainRecursive(taskId, graph, chain, visited);
    
    return chain;
  }

  /**
   * Recursively build dependency chain
   */
  private buildDependencyChainRecursive(
    taskId: string,
    graph: Map<string, Set<string>>,
    chain: string[],
    visited: Set<string>
  ): void {
    if (visited.has(taskId)) {
      return;
    }
    
    visited.add(taskId);
    const dependencies = graph.get(taskId) || new Set();
    
    for (const depId of dependencies) {
      this.buildDependencyChainRecursive(depId, graph, chain, visited);
      if (!chain.includes(depId)) {
        chain.push(depId);
      }
    }
    
    if (!chain.includes(taskId)) {
      chain.push(taskId);
    }
  }

  /**
   * Validate dependency configuration
   */
  public validateDependencies(tasks: GeneratedTask[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const taskIds = new Set(tasks.map(t => t.ruleId));
    
    // Check for invalid dependency references
    for (const task of tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          if (!taskIds.has(depId)) {
            errors.push(`Task ${task.ruleId} references non-existent dependency: ${depId}`);
          }
        }
      }
    }
    
    // Check for circular dependencies
    try {
      const graph = this.buildDependencyGraph(tasks);
      this.validateNoCycles(graph);
    } catch (error) {
      if (error instanceof RuleEngineError && error.code === 'DEPENDENCY_CYCLE_DETECTED') {
        errors.push(error.message);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
