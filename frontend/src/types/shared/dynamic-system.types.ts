/**
 * Dynamic System Types - Core utilities for unlimited world building
 * These types provide the foundation for creating completely flexible game systems
 */

// ============================================================================
// DYNAMIC TYPE SYSTEM FOUNDATION
// ============================================================================

/**
 * Universal dynamic entity - can represent anything in the game world
 */
export interface UniversalEntity {
  // Core Identity
  id: string;
  type: string; // 'character', 'item', 'location', 'skill', 'event', etc.
  subtype?: string;
  name: string;
  description?: string;

  // Dynamic Properties - completely flexible
  properties: DynamicPropertyMap;

  // Metadata
  metadata: EntityMetadata;

  // Relationships
  relationships: EntityRelationship[];

  // Behaviors
  behaviors: EntityBehavior[];

  // State Management
  state: EntityState;

  // Lifecycle
  lifecycle: EntityLifecycle;
}

/**
 * Dynamic property map - stores any type of data
 */
export interface DynamicPropertyMap {
  // Core properties that most entities have
  core?: CoreProperties;

  // Numeric values with modifiers
  values?: Record<string, DynamicNumericValue>;

  // Text/string properties
  text?: Record<string, DynamicTextValue>;

  // Boolean flags
  flags?: Record<string, DynamicBooleanValue>;

  // Lists and arrays
  lists?: Record<string, DynamicListValue>;

  // Complex objects
  objects?: Record<string, DynamicObjectValue>;

  // Custom properties - anything goes
  custom?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * Core properties that most entities share
 */
export interface CoreProperties {
  level?: number;
  rarity?: string;
  quality?: string;
  condition?: string;
  owner?: string;
  location?: string;
  tags?: string[];
  categories?: string[];
}

/**
 * Dynamic numeric value with modifiers and constraints
 */
export interface DynamicNumericValue {
  base: number;
  current: number;

  // Constraints
  min?: number;
  max?: number;

  // Modifiers
  modifiers: NumericModifier[];

  // Temporary effects
  temporary?: TemporaryNumericEffect[];

  // History
  history?: NumericValueHistory[];

  // Display
  displayFormat?: 'integer' | 'decimal' | 'percentage' | 'currency' | 'custom';
  displayPrecision?: number;
}

/**
 * Numeric modifier
 */
export interface NumericModifier {
  id: string;
  name: string;
  type: 'flat' | 'percentage' | 'multiplier' | 'exponential' | 'custom';
  value: number;

  // Source & Context
  source: string;
  sourceType: 'item' | 'skill' | 'status' | 'talent' | 'environment' | 'custom';

  // Conditions
  conditions?: ModifierCondition[];

  // Duration
  permanent: boolean;
  duration?: number;
  remainingTime?: number;

  // Stacking
  stackable: boolean;
  maxStacks?: number;
  currentStacks?: number;

  // Priority
  priority: number;
}

/**
 * Modifier condition
 */
export interface ModifierCondition {
  type: 'time' | 'location' | 'health' | 'status' | 'equipment' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  description?: string;
}

/**
 * Temporary numeric effect
 */
export interface TemporaryNumericEffect {
  id: string;
  name: string;
  value: number;
  duration: number;
  remainingTime: number;
  source: string;

  // Effect Properties
  decayType?: 'linear' | 'exponential' | 'step' | 'none';
  decayRate?: number;
}

/**
 * Numeric value history
 */
export interface NumericValueHistory {
  timestamp: string;
  oldValue: number;
  newValue: number;
  change: number;
  reason: string;
  source?: string;
}

/**
 * Dynamic text value
 */
export interface DynamicTextValue {
  value: string;

  // Localization
  localized?: Record<string, string>;

  // Formatting
  format?: 'plain' | 'markdown' | 'html' | 'rich_text';

  // Variables
  variables?: Record<string, string | number | boolean>;
  template?: string;

  // Validation
  constraints?: TextConstraint[];

  // History
  history?: TextValueHistory[];
}

/**
 * Text constraint
 */
export interface TextConstraint {
  type: 'length' | 'pattern' | 'forbidden_words' | 'custom';
  constraint: string | number | string[] | RegExp;
  errorMessage?: string;
}

/**
 * Text value history
 */
export interface TextValueHistory {
  timestamp: string;
  oldValue: string;
  newValue: string;
  reason: string;
  source?: string;
}

/**
 * Dynamic boolean value
 */
export interface DynamicBooleanValue {
  value: boolean;

  // Conditions
  conditions?: BooleanCondition[];

  // Auto-toggle
  autoToggle?: AutoToggleConfig;

  // History
  history?: BooleanValueHistory[];
}

/**
 * Boolean condition
 */
export interface BooleanCondition {
  type: 'time' | 'event' | 'value' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  result: boolean;
  priority: number;
}

/**
 * Auto-toggle configuration
 */
export interface AutoToggleConfig {
  enabled: boolean;
  interval?: number;
  conditions?: BooleanCondition[];
  togglePattern?: boolean[];
}

/**
 * Boolean value history
 */
export interface BooleanValueHistory {
  timestamp: string;
  oldValue: boolean;
  newValue: boolean;
  reason: string;
  source?: string;
}

/**
 * Dynamic list value
 */
export interface DynamicListValue {
  items: DynamicListItem[];

  // List Properties
  maxSize?: number;
  allowDuplicates?: boolean;
  sorted?: boolean;
  sortCriteria?: SortCriteria;

  // Constraints
  itemConstraints?: ListItemConstraint[];

  // History
  history?: ListValueHistory[];
}

/**
 * Dynamic list item
 */
export interface DynamicListItem {
  id: string;
  value: string | number | boolean | Record<string, unknown>;

  // Item Properties
  weight?: number;
  priority?: number;
  tags?: string[];

  // Metadata
  addedAt: string;
  addedBy?: string;

  // Expiration
  expiresAt?: string;

  // Conditions
  conditions?: ItemCondition[];
}

/**
 * Sort criteria
 */
export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
  type: 'string' | 'number' | 'date' | 'custom';
  customComparator?: string;
}

/**
 * List item constraint
 */
export interface ListItemConstraint {
  type: 'type' | 'value' | 'pattern' | 'custom';
  constraint:
    | string
    | number
    | boolean
    | string[]
    | RegExp
    | Record<string, unknown>;
  errorMessage?: string;
}

/**
 * Item condition
 */
export interface ItemCondition {
  type: 'time' | 'location' | 'event' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  action: 'show' | 'hide' | 'remove' | 'modify';
}

/**
 * List value history
 */
export interface ListValueHistory {
  timestamp: string;
  action: 'add' | 'remove' | 'modify' | 'sort' | 'clear';
  details: Record<string, unknown>;
  reason: string;
  source?: string;
}

/**
 * Dynamic object value
 */
export interface DynamicObjectValue {
  data: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;

  // Schema
  schema?: ObjectSchema;

  // Validation
  validators?: ObjectValidator[];

  // Computed Properties
  computed?: ComputedProperty[];

  // History
  history?: ObjectValueHistory[];
}

/**
 * Object schema
 */
export interface ObjectSchema {
  properties: Record<string, PropertySchema>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Property schema
 */
export interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'unknown';
  description?: string;
  constraints?: (
    | string
    | number
    | boolean
    | RegExp
    | Record<string, unknown>
  )[];
  default?: string | number | boolean | string[] | Record<string, unknown>;
}

/**
 * Object validator
 */
export interface ObjectValidator {
  name: string;
  validator: (
    value: string | number | boolean | string[] | Record<string, unknown>,
  ) => boolean | string;
  errorMessage?: string;
}

/**
 * Computed property
 */
export interface ComputedProperty {
  name: string;
  dependencies: string[];
  calculator: (
    data: Record<
      string,
      string | number | boolean | string[] | Record<string, unknown>
    >,
  ) => string | number | boolean | string[] | Record<string, unknown>;
  cached?: boolean;
  cacheTimeout?: number;
}

/**
 * Object value history
 */
export interface ObjectValueHistory {
  timestamp: string;
  property: string;
  oldValue: string | number | boolean | string[] | Record<string, unknown>;
  newValue: string | number | boolean | string[] | Record<string, unknown>;
  reason: string;
  source?: string;
}

// ============================================================================
// ENTITY METADATA & RELATIONSHIPS
// ============================================================================

/**
 * Entity metadata
 */
export interface EntityMetadata {
  // Creation Info
  createdAt: string;
  createdBy?: string;
  createdFrom?: string; // Template, generator, etc.

  // Modification Info
  updatedAt: string;
  updatedBy?: string;
  version: number;

  // Classification
  tags: string[];
  categories: string[];

  // Visibility & Access
  visibility: 'public' | 'private' | 'restricted' | 'hidden';
  accessLevel: number;
  permissions?: EntityPermission[];

  // Quality & Validation
  validated: boolean;
  validationErrors?: string[];
  quality: number; // 0-100

  // Usage Statistics
  usageCount?: number;
  lastUsed?: string;

  // Custom Metadata
  custom?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * Entity permission
 */
export interface EntityPermission {
  subject: string; // User ID, role, etc.
  subjectType: 'user' | 'role' | 'group' | 'system';
  permissions: string[]; // 'read', 'write', 'delete', 'execute', etc.
  conditions?: PermissionCondition[];
}

/**
 * Permission condition
 */
export interface PermissionCondition {
  type: 'time' | 'location' | 'context' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  description?: string;
}

/**
 * Entity relationship
 */
export interface EntityRelationship {
  id: string;
  type: string; // 'parent', 'child', 'sibling', 'dependency', 'conflict', etc.
  targetId: string;
  targetType: string;

  // Relationship Properties
  strength: number; // 0-100
  bidirectional: boolean;

  // Relationship Data
  data?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;

  // Conditions
  conditions?: RelationshipCondition[];

  // Lifecycle
  createdAt: string;
  expiresAt?: string;

  // Metadata
  metadata?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * Relationship condition
 */
export interface RelationshipCondition {
  type: 'distance' | 'state' | 'time' | 'event' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  action: 'maintain' | 'strengthen' | 'weaken' | 'break';
}

// ============================================================================
// ENTITY BEHAVIORS & STATE
// ============================================================================

/**
 * Entity behavior
 */
export interface EntityBehavior {
  id: string;
  name: string;
  type: 'passive' | 'reactive' | 'proactive' | 'scheduled' | 'custom';

  // Behavior Definition
  triggers: BehaviorTrigger[];
  actions: BehaviorAction[];

  // Behavior Properties
  priority: number;
  enabled: boolean;

  // Conditions
  conditions?: BehaviorCondition[];

  // Cooldown & Limits
  cooldown?: number;
  lastExecuted?: string;
  executionCount?: number;
  maxExecutions?: number;

  // Context
  context?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * Behavior trigger
 */
export interface BehaviorTrigger {
  type: 'time' | 'event' | 'condition' | 'interaction' | 'custom';
  trigger: string | number | boolean | Record<string, unknown>;

  // Trigger Properties
  probability?: number;
  delay?: number;

  // Conditions
  conditions?: TriggerCondition[];
}

/**
 * Trigger condition
 */
export interface TriggerCondition {
  type: 'state' | 'relationship' | 'environment' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  required: boolean;
}

/**
 * Behavior action
 */
export interface BehaviorAction {
  id: string;
  type:
    | 'modify_property'
    | 'create_entity'
    | 'send_message'
    | 'trigger_event'
    | 'custom';
  action: string | number | boolean | Record<string, unknown>;

  // Action Properties
  order: number;
  probability?: number;

  // Conditions
  conditions?: ActionCondition[];

  // Effects
  effects?: ActionEffect[];
}

/**
 * Action condition
 */
export interface ActionCondition {
  type: 'resource' | 'permission' | 'state' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  required: boolean;
}

/**
 * Action effect
 */
export interface ActionEffect {
  type: 'immediate' | 'delayed' | 'conditional' | 'persistent';
  effect: string | number | boolean | Record<string, unknown>;
  duration?: number;
  conditions?: EffectCondition[];
}

/**
 * Effect condition
 */
export interface EffectCondition {
  type: 'time' | 'state' | 'event' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  description?: string;
}

/**
 * Behavior condition
 */
export interface BehaviorCondition {
  type: 'state' | 'time' | 'resource' | 'relationship' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  required: boolean;
  description?: string;
}

/**
 * Entity state
 */
export interface EntityState {
  // Current State
  current: string;
  previous?: string;

  // State Machine
  states: StateDefinition[];
  transitions: StateTransition[];

  // State Data
  stateData?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;

  // History
  stateHistory: StateHistoryEntry[];

  // Persistence
  persistent: boolean;
  autoSave?: boolean;
}

/**
 * State definition
 */
export interface StateDefinition {
  id: string;
  name: string;
  description?: string;

  // State Properties
  entryActions?: BehaviorAction[];
  exitActions?: BehaviorAction[];
  stateActions?: BehaviorAction[];

  // Conditions
  entryConditions?: StateCondition[];
  exitConditions?: StateCondition[];

  // Metadata
  metadata?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * State transition
 */
export interface StateTransition {
  id: string;
  fromState: string;
  toState: string;

  // Transition Properties
  triggers: TransitionTrigger[];
  conditions?: TransitionCondition[];
  actions?: BehaviorAction[];

  // Transition Data
  cost?: TransitionCost[];
  duration?: number;

  // Metadata
  metadata?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * State condition
 */
export interface StateCondition {
  type: 'property' | 'relationship' | 'time' | 'event' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  required: boolean;
}

/**
 * Transition trigger
 */
export interface TransitionTrigger {
  type: 'manual' | 'automatic' | 'time' | 'event' | 'condition' | 'custom';
  trigger: string | number | boolean | Record<string, unknown>;
  probability?: number;
}

/**
 * Transition condition
 */
export interface TransitionCondition {
  type: 'resource' | 'permission' | 'state' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  required: boolean;
}

/**
 * Transition cost
 */
export interface TransitionCost {
  resource: string;
  amount: number;
  type: 'consume' | 'reserve' | 'check';
}

/**
 * State history entry
 */
export interface StateHistoryEntry {
  timestamp: string;
  fromState?: string;
  toState: string;
  trigger?: string;
  reason?: string;
  data?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * Entity lifecycle
 */
export interface EntityLifecycle {
  // Lifecycle State
  phase:
    | 'created'
    | 'initializing'
    | 'active'
    | 'inactive'
    | 'deprecated'
    | 'destroyed';

  // Lifecycle Events
  events: LifecycleEvent[];

  // Lifecycle Rules
  rules: LifecycleRule[];

  // Cleanup
  cleanupActions?: BehaviorAction[];

  // Persistence
  persistent: boolean;
  backupFrequency?: number;
  lastBackup?: string;
}

/**
 * Lifecycle event
 */
export interface LifecycleEvent {
  phase: string;
  timestamp: string;
  trigger?: string;
  data?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * Lifecycle rule
 */
export interface LifecycleRule {
  fromPhase: string;
  toPhase: string;
  conditions: LifecycleCondition[];
  actions?: BehaviorAction[];
  automatic?: boolean;
}

/**
 * Lifecycle condition
 */
export interface LifecycleCondition {
  type: 'time' | 'usage' | 'condition' | 'manual' | 'custom';
  condition: string | number | boolean | Record<string, unknown>;
  required: boolean;
}

// ============================================================================
// DYNAMIC SYSTEM UTILITIES
// ============================================================================

/**
 * Type registry for dynamic types
 */
export interface TypeRegistry {
  types: Record<string, TypeDefinition>;

  // Registry Operations
  registerType: (definition: TypeDefinition) => void;
  getType: (typeName: string) => TypeDefinition | undefined;
  listTypes: () => string[];

  // Validation
  validateEntity: (entity: UniversalEntity) => ValidationResult;
}

/**
 * Type definition
 */
export interface TypeDefinition {
  name: string;
  description?: string;

  // Type Properties
  baseType?: string; // Inheritance
  abstract?: boolean;

  // Schema
  propertySchema: Record<string, PropertySchema>;
  requiredProperties: string[];

  // Behaviors
  defaultBehaviors?: EntityBehavior[];

  // Validation
  validators?: TypeValidator[];

  // Factory
  factory?: EntityFactory;

  // Metadata
  metadata?: Record<
    string,
    string | number | boolean | string[] | Record<string, unknown>
  >;
}

/**
 * Type validator
 */
export interface TypeValidator {
  name: string;
  validator: (entity: UniversalEntity) => boolean | string;
  errorMessage?: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Entity factory
 */
export interface EntityFactory {
  create: (
    params: Record<
      string,
      string | number | boolean | string[] | Record<string, unknown>
    >,
  ) => UniversalEntity;
  template?: Partial<UniversalEntity>;
  parameterSchema?: Record<string, PropertySchema>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Dynamic query system
 */
export interface DynamicQuery {
  // Query Structure
  select?: string[];
  from: string; // Entity type
  where?: QueryCondition[];
  orderBy?: QuerySort[];
  limit?: number;
  offset?: number;

  // Joins
  joins?: QueryJoin[];

  // Aggregation
  groupBy?: string[];
  having?: QueryCondition[];

  // Advanced
  distinct?: boolean;
  subqueries?: DynamicQuery[];
}

/**
 * Query condition
 */
export interface QueryCondition {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'like'
    | 'regex'
    | 'exists'
    | 'custom';
  value: string | number | boolean | string[] | Record<string, unknown>;

  // Logical Operators
  and?: QueryCondition[];
  or?: QueryCondition[];
  not?: QueryCondition;
}

/**
 * Query sort
 */
export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
  nullsFirst?: boolean;
}

/**
 * Query join
 */
export interface QueryJoin {
  type: 'inner' | 'left' | 'right' | 'full';
  target: string; // Entity type
  on: QueryCondition[];
  alias?: string;
}
