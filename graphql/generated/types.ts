import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  token: Scalars['String']['output'];
  user: User;
};

export type CoachDetails = {
  __typename?: 'CoachDetails';
  clientsIds?: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  moreDetails?: Maybe<Scalars['String']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  sessionsIds?: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  specialization?: Maybe<Array<Scalars['String']['output']>>;
  teachingDate?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  teachingTime?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  yearsOfExperience?: Maybe<Scalars['Int']['output']>;
};

export type CoachDetailsInput = {
  clientsIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  moreDetails?: InputMaybe<Scalars['String']['input']>;
  ratings?: InputMaybe<Scalars['Float']['input']>;
  sessionsIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  specialization?: InputMaybe<Array<Scalars['String']['input']>>;
  teachingDate?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  teachingTime?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  yearsOfExperience?: InputMaybe<Scalars['Int']['input']>;
};

export type ConfirmSessionCompletionInput = {
  confirm: Scalars['Boolean']['input'];
  sessionLogId: Scalars['ID']['input'];
};

export type CreateGoalInput = {
  currentWeight?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  goalType: FitnessGoalType;
  targetDate?: InputMaybe<Scalars['String']['input']>;
  targetWeight?: InputMaybe<Scalars['Float']['input']>;
  title: Scalars['String']['input'];
};

export type CreateMembershipInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  durationType: DurationType;
  features: Array<Scalars['String']['input']>;
  monthlyPrice: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  status: MembershipStatus;
};

export type CreateSessionInput = {
  clientsIds: Array<Scalars['ID']['input']>;
  date: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  gymArea: Scalars['String']['input'];
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['String']['input'];
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSessionLogInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  sessionId: Scalars['ID']['input'];
  weight: Scalars['Float']['input'];
};

export type CreateUserInput = {
  agreedToLiabilityWaiver?: InputMaybe<Scalars['Boolean']['input']>;
  agreedToPrivacyPolicy?: InputMaybe<Scalars['Boolean']['input']>;
  agreedToTermsAndConditions?: InputMaybe<Scalars['Boolean']['input']>;
  coachDetails?: InputMaybe<CoachDetailsInput>;
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  heardFrom?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lastName: Scalars['String']['input'];
  membershipDetails?: InputMaybe<MemberDetailsInput>;
  password: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  role: RoleType;
};

export type DurationType =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'YEARLY';

export type FitnessGoalType =
  | 'ATHLETIC_PERFORMANCE'
  | 'ENDURANCE'
  | 'FLEXIBILITY'
  | 'GENERAL_FITNESS'
  | 'MUSCLE_BUILDING'
  | 'REHABILITATION'
  | 'STRENGTH_TRAINING'
  | 'WEIGHT_LOSS';

export type Goal = {
  __typename?: 'Goal';
  client?: Maybe<User>;
  clientId: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  currentWeight?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  goalType: FitnessGoalType;
  id: Scalars['ID']['output'];
  status: GoalStatus;
  targetDate?: Maybe<Scalars['String']['output']>;
  targetWeight?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type GoalStatus =
  | 'active'
  | 'cancelled'
  | 'completed'
  | 'paused';

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MemberDetails = {
  __typename?: 'MemberDetails';
  coachesIds?: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  fitnessGoal?: Maybe<Array<Scalars['String']['output']>>;
  membershipId?: Maybe<Scalars['ID']['output']>;
  membershipTransaction?: Maybe<MembershipTransaction>;
  physiqueGoalType: Scalars['String']['output'];
  workOutTime?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type MemberDetailsInput = {
  coachesIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  fitnessGoal?: InputMaybe<Array<Scalars['String']['input']>>;
  membershipId?: InputMaybe<Scalars['ID']['input']>;
  physiqueGoalType: Scalars['String']['input'];
  workOutTime?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type Membership = {
  __typename?: 'Membership';
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  durationType: DurationType;
  features: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  monthlyPrice: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  status: MembershipStatus;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type MembershipStatus =
  | 'ACTIVE'
  | 'COMING_SOON'
  | 'INACTIVE';

export type MembershipTransaction = {
  __typename?: 'MembershipTransaction';
  client?: Maybe<User>;
  clientId: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  expiresAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  membership?: Maybe<Membership>;
  membershipId: Scalars['ID']['output'];
  priceAtPurchase: Scalars['Float']['output'];
  startedAt: Scalars['String']['output'];
  status: TransactionStatus;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  cancelMembership: Scalars['Boolean']['output'];
  cancelSession: Scalars['Boolean']['output'];
  clientConfirmWeight: SessionLog;
  completeSession: SessionLog;
  confirmSessionCompletion: SessionLog;
  createGoal: Goal;
  createMembership: Membership;
  createSession: Session;
  createUser: AuthResponse;
  deleteGoal: Scalars['Boolean']['output'];
  deleteUser?: Maybe<Scalars['Boolean']['output']>;
  login: AuthResponse;
  purchaseMembership: MembershipTransaction;
  updateGoal: Goal;
  updateSession: Session;
  updateUser?: Maybe<User>;
};


export type MutationCancelMembershipArgs = {
  transactionId: Scalars['ID']['input'];
};


export type MutationCancelSessionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationClientConfirmWeightArgs = {
  sessionLogId: Scalars['ID']['input'];
};


export type MutationCompleteSessionArgs = {
  input: CreateSessionLogInput;
};


export type MutationConfirmSessionCompletionArgs = {
  input: ConfirmSessionCompletionInput;
};


export type MutationCreateGoalArgs = {
  input: CreateGoalInput;
};


export type MutationCreateMembershipArgs = {
  input: CreateMembershipInput;
};


export type MutationCreateSessionArgs = {
  input: CreateSessionInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteGoalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationPurchaseMembershipArgs = {
  input: PurchaseMembershipInput;
};


export type MutationUpdateGoalArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGoalInput;
};


export type MutationUpdateSessionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSessionInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: CreateUserInput;
};

export type PurchaseMembershipInput = {
  membershipId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  getClientSessions: Array<Session>;
  getCoachSessions: Array<Session>;
  getCurrentMembership?: Maybe<MembershipTransaction>;
  getGoal?: Maybe<Goal>;
  getGoals: Array<Goal>;
  getMembership?: Maybe<Membership>;
  getMembershipTransaction?: Maybe<MembershipTransaction>;
  getMemberships: Array<Membership>;
  getSession?: Maybe<Session>;
  getSessionLogs: Array<SessionLog>;
  getUpcomingSessions: Array<Session>;
  getUser?: Maybe<User>;
  getUsers?: Maybe<Array<Maybe<User>>>;
  getWeightProgress: Array<SessionLog>;
  getWeightProgressChart: Array<WeightProgress>;
};


export type QueryGetClientSessionsArgs = {
  clientId: Scalars['ID']['input'];
  status?: InputMaybe<SessionStatus>;
};


export type QueryGetCoachSessionsArgs = {
  coachId: Scalars['ID']['input'];
  status?: InputMaybe<SessionStatus>;
};


export type QueryGetGoalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetGoalsArgs = {
  clientId: Scalars['ID']['input'];
  status?: InputMaybe<GoalStatus>;
};


export type QueryGetMembershipArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetMembershipTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetMembershipsArgs = {
  status?: InputMaybe<MembershipStatus>;
};


export type QueryGetSessionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetSessionLogsArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryGetUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetUsersArgs = {
  role?: InputMaybe<RoleType>;
};


export type QueryGetWeightProgressArgs = {
  clientId: Scalars['ID']['input'];
  goalId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetWeightProgressChartArgs = {
  clientId: Scalars['ID']['input'];
  goalId?: InputMaybe<Scalars['ID']['input']>;
};

export type RoleType =
  | 'admin'
  | 'coach'
  | 'member';

export type Session = {
  __typename?: 'Session';
  clients?: Maybe<Array<User>>;
  clientsIds: Array<Scalars['ID']['output']>;
  coach?: Maybe<User>;
  coachId: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
  endTime?: Maybe<Scalars['String']['output']>;
  gymArea: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['String']['output'];
  status: SessionStatus;
  time?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  workoutType?: Maybe<Scalars['String']['output']>;
};

export type SessionLog = {
  __typename?: 'SessionLog';
  client?: Maybe<User>;
  clientConfirmed: Scalars['Boolean']['output'];
  clientId: Scalars['ID']['output'];
  coach?: Maybe<User>;
  coachConfirmed: Scalars['Boolean']['output'];
  coachId: Scalars['ID']['output'];
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  session?: Maybe<Session>;
  sessionId: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  weight: Scalars['Float']['output'];
};

export type SessionStatus =
  | 'cancelled'
  | 'completed'
  | 'scheduled';

export type TransactionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'EXPIRED';

export type UpdateGoalInput = {
  currentWeight?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  goalType?: InputMaybe<FitnessGoalType>;
  status?: InputMaybe<GoalStatus>;
  targetDate?: InputMaybe<Scalars['String']['input']>;
  targetWeight?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSessionInput = {
  date?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  gymArea?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<SessionStatus>;
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  agreedToLiabilityWaiver?: Maybe<Scalars['Boolean']['output']>;
  agreedToPrivacyPolicy?: Maybe<Scalars['Boolean']['output']>;
  agreedToTermsAndConditions?: Maybe<Scalars['Boolean']['output']>;
  coachDetails?: Maybe<CoachDetails>;
  createdAt?: Maybe<Scalars['String']['output']>;
  currentMembership?: Maybe<MembershipTransaction>;
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  heardFrom?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  membershipDetails?: Maybe<MemberDetails>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  role: RoleType;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type WeightProgress = {
  __typename?: 'WeightProgress';
  date: Scalars['String']['output'];
  sessionId?: Maybe<Scalars['ID']['output']>;
  sessionLogId?: Maybe<Scalars['ID']['output']>;
  weight: Scalars['Float']['output'];
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', token: string, user: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string, heardFrom?: Array<string | null> | null, agreedToTermsAndConditions?: boolean | null, agreedToPrivacyPolicy?: boolean | null, agreedToLiabilityWaiver?: boolean | null, createdAt?: string | null, updatedAt?: string | null, membershipDetails?: { __typename?: 'MemberDetails', membershipId?: string | null, physiqueGoalType: string, fitnessGoal?: Array<string> | null, workOutTime?: Array<string | null> | null, coachesIds?: Array<string | null> | null } | null, coachDetails?: { __typename?: 'CoachDetails', clientsIds?: Array<string | null> | null, sessionsIds?: Array<string | null> | null, specialization?: Array<string> | null, ratings?: number | null, yearsOfExperience?: number | null, moreDetails?: string | null, teachingDate?: Array<string | null> | null, teachingTime?: Array<string | null> | null } | null } } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'AuthResponse', token: string, user: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string, heardFrom?: Array<string | null> | null, agreedToTermsAndConditions?: boolean | null, agreedToPrivacyPolicy?: boolean | null, agreedToLiabilityWaiver?: boolean | null, createdAt?: string | null, updatedAt?: string | null, membershipDetails?: { __typename?: 'MemberDetails', membershipId?: string | null, physiqueGoalType: string, fitnessGoal?: Array<string> | null, workOutTime?: Array<string | null> | null, coachesIds?: Array<string | null> | null } | null, coachDetails?: { __typename?: 'CoachDetails', clientsIds?: Array<string | null> | null, sessionsIds?: Array<string | null> | null, specialization?: Array<string> | null, ratings?: number | null, yearsOfExperience?: number | null, moreDetails?: string | null, teachingDate?: Array<string | null> | null, teachingTime?: Array<string | null> | null } | null } } };

export type CreateSessionMutationVariables = Exact<{
  input: CreateSessionInput;
}>;


export type CreateSessionMutation = { __typename?: 'Mutation', createSession: { __typename?: 'Session', id: string, coachId: string, clientsIds: Array<string>, name: string, workoutType?: string | null, date: string, startTime: string, endTime?: string | null, gymArea: string, note?: string | null, status: SessionStatus, createdAt?: string | null, coach?: { __typename?: 'User', id: string, firstName: string, lastName: string } | null, clients?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: string }> | null } };

export type UpdateSessionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSessionInput;
}>;


export type UpdateSessionMutation = { __typename?: 'Mutation', updateSession: { __typename?: 'Session', id: string, name: string, workoutType?: string | null, date: string, startTime: string, endTime?: string | null, gymArea: string, note?: string | null, status: SessionStatus } };

export type CancelSessionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CancelSessionMutation = { __typename?: 'Mutation', cancelSession: boolean };

export type CompleteSessionMutationVariables = Exact<{
  input: CreateSessionLogInput;
}>;


export type CompleteSessionMutation = { __typename?: 'Mutation', completeSession: { __typename?: 'SessionLog', id: string, sessionId: string, clientId: string, coachId: string, weight: number, clientConfirmed: boolean, coachConfirmed: boolean, notes?: string | null, completedAt?: string | null } };

export type ConfirmSessionCompletionMutationVariables = Exact<{
  input: ConfirmSessionCompletionInput;
}>;


export type ConfirmSessionCompletionMutation = { __typename?: 'Mutation', confirmSessionCompletion: { __typename?: 'SessionLog', id: string, clientConfirmed: boolean, coachConfirmed: boolean } };

export type ClientConfirmWeightMutationVariables = Exact<{
  sessionLogId: Scalars['ID']['input'];
}>;


export type ClientConfirmWeightMutation = { __typename?: 'Mutation', clientConfirmWeight: { __typename?: 'SessionLog', id: string, clientConfirmed: boolean, coachConfirmed: boolean } };

export type CreateGoalMutationVariables = Exact<{
  input: CreateGoalInput;
}>;


export type CreateGoalMutation = { __typename?: 'Mutation', createGoal: { __typename?: 'Goal', id: string, clientId: string, goalType: FitnessGoalType, title: string, description?: string | null, targetWeight?: number | null, currentWeight?: number | null, targetDate?: string | null, status: GoalStatus, createdAt?: string | null } };

export type UpdateGoalMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateGoalInput;
}>;


export type UpdateGoalMutation = { __typename?: 'Mutation', updateGoal: { __typename?: 'Goal', id: string, goalType: FitnessGoalType, title: string, description?: string | null, targetWeight?: number | null, currentWeight?: number | null, targetDate?: string | null, status: GoalStatus } };

export type DeleteGoalMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGoalMutation = { __typename?: 'Mutation', deleteGoal: boolean };

export type PurchaseMembershipMutationVariables = Exact<{
  input: PurchaseMembershipInput;
}>;


export type PurchaseMembershipMutation = { __typename?: 'Mutation', purchaseMembership: { __typename?: 'MembershipTransaction', id: string, clientId: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, features: Array<string> } | null } };

export type CancelMembershipMutationVariables = Exact<{
  transactionId: Scalars['ID']['input'];
}>;


export type CancelMembershipMutation = { __typename?: 'Mutation', cancelMembership: boolean };

export type GetUpcomingSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUpcomingSessionsQuery = { __typename?: 'Query', getUpcomingSessions: Array<{ __typename?: 'Session', id: string, coachId: string, clientsIds: Array<string>, name: string, workoutType?: string | null, date: string, startTime: string, endTime?: string | null, gymArea: string, note?: string | null, status: SessionStatus, createdAt?: string | null, coach?: { __typename?: 'User', id: string, firstName: string, lastName: string } | null, clients?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: string }> | null }> };

export type GetCoachSessionsQueryVariables = Exact<{
  coachId: Scalars['ID']['input'];
  status?: InputMaybe<SessionStatus>;
}>;


export type GetCoachSessionsQuery = { __typename?: 'Query', getCoachSessions: Array<{ __typename?: 'Session', id: string, coachId: string, clientsIds: Array<string>, name: string, workoutType?: string | null, date: string, startTime: string, endTime?: string | null, gymArea: string, note?: string | null, status: SessionStatus, createdAt?: string | null, clients?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: string }> | null }> };

export type GetClientSessionsQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
  status?: InputMaybe<SessionStatus>;
}>;


export type GetClientSessionsQuery = { __typename?: 'Query', getClientSessions: Array<{ __typename?: 'Session', id: string, coachId: string, name: string, workoutType?: string | null, date: string, startTime: string, endTime?: string | null, gymArea: string, note?: string | null, status: SessionStatus, createdAt?: string | null, coach?: { __typename?: 'User', id: string, firstName: string, lastName: string } | null }> };

export type GetSessionQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSessionQuery = { __typename?: 'Query', getSession?: { __typename?: 'Session', id: string, coachId: string, clientsIds: Array<string>, name: string, workoutType?: string | null, date: string, startTime: string, endTime?: string | null, gymArea: string, note?: string | null, status: SessionStatus, createdAt?: string | null, coach?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string } | null, clients?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: string }> | null } | null };

export type GetSessionLogsQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
}>;


export type GetSessionLogsQuery = { __typename?: 'Query', getSessionLogs: Array<{ __typename?: 'SessionLog', id: string, sessionId: string, weight: number, clientConfirmed: boolean, coachConfirmed: boolean, notes?: string | null, completedAt?: string | null, session?: { __typename?: 'Session', id: string, name: string, date: string } | null }> };

export type GetWeightProgressQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
  goalId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetWeightProgressQuery = { __typename?: 'Query', getWeightProgress: Array<{ __typename?: 'SessionLog', id: string, weight: number, completedAt?: string | null, session?: { __typename?: 'Session', id: string, name: string, date: string } | null }> };

export type GetGoalsQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
  status?: InputMaybe<GoalStatus>;
}>;


export type GetGoalsQuery = { __typename?: 'Query', getGoals: Array<{ __typename?: 'Goal', id: string, clientId: string, goalType: FitnessGoalType, title: string, description?: string | null, targetWeight?: number | null, currentWeight?: number | null, targetDate?: string | null, status: GoalStatus, createdAt?: string | null, updatedAt?: string | null }> };

export type GetGoalQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGoalQuery = { __typename?: 'Query', getGoal?: { __typename?: 'Goal', id: string, clientId: string, goalType: FitnessGoalType, title: string, description?: string | null, targetWeight?: number | null, currentWeight?: number | null, targetDate?: string | null, status: GoalStatus, createdAt?: string | null, updatedAt?: string | null } | null };

export type GetWeightProgressChartQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
  goalId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetWeightProgressChartQuery = { __typename?: 'Query', getWeightProgressChart: Array<{ __typename?: 'WeightProgress', date: string, weight: number, sessionId?: string | null, sessionLogId?: string | null }> };

export type GetMembershipsQueryVariables = Exact<{
  status?: InputMaybe<MembershipStatus>;
}>;


export type GetMembershipsQuery = { __typename?: 'Query', getMemberships: Array<{ __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType }> };

export type GetMembershipQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMembershipQuery = { __typename?: 'Query', getMembership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType } | null };

export type GetCurrentMembershipQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentMembershipQuery = { __typename?: 'Query', getCurrentMembership?: { __typename?: 'MembershipTransaction', id: string, clientId: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, durationType: DurationType } | null } | null };

export type GetUsersQueryVariables = Exact<{
  role?: InputMaybe<RoleType>;
}>;


export type GetUsersQuery = { __typename?: 'Query', getUsers?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, coachDetails?: { __typename?: 'CoachDetails', specialization?: Array<string> | null, ratings?: number | null, yearsOfExperience?: number | null } | null } | null> | null };


export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    user {
      id
      firstName
      lastName
      email
      role
      phoneNumber
      dateOfBirth
      gender
      heardFrom
      agreedToTermsAndConditions
      agreedToPrivacyPolicy
      agreedToLiabilityWaiver
      membershipDetails {
        membershipId
        physiqueGoalType
        fitnessGoal
        workOutTime
        coachesIds
      }
      coachDetails {
        clientsIds
        sessionsIds
        specialization
        ratings
        yearsOfExperience
        moreDetails
        teachingDate
        teachingTime
      }
      createdAt
      updatedAt
    }
    token
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    user {
      id
      firstName
      lastName
      email
      role
      phoneNumber
      dateOfBirth
      gender
      heardFrom
      agreedToTermsAndConditions
      agreedToPrivacyPolicy
      agreedToLiabilityWaiver
      membershipDetails {
        membershipId
        physiqueGoalType
        fitnessGoal
        workOutTime
        coachesIds
      }
      coachDetails {
        clientsIds
        sessionsIds
        specialization
        ratings
        yearsOfExperience
        moreDetails
        teachingDate
        teachingTime
      }
      createdAt
      updatedAt
    }
    token
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const CreateSessionDocument = gql`
    mutation CreateSession($input: CreateSessionInput!) {
  createSession(input: $input) {
    id
    coachId
    coach {
      id
      firstName
      lastName
    }
    clientsIds
    clients {
      id
      firstName
      lastName
      email
    }
    name
    workoutType
    date
    startTime
    endTime
    gymArea
    note
    status
    createdAt
  }
}
    `;
export type CreateSessionMutationFn = Apollo.MutationFunction<CreateSessionMutation, CreateSessionMutationVariables>;

/**
 * __useCreateSessionMutation__
 *
 * To run a mutation, you first call `useCreateSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSessionMutation, { data, loading, error }] = useCreateSessionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSessionMutation(baseOptions?: Apollo.MutationHookOptions<CreateSessionMutation, CreateSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSessionMutation, CreateSessionMutationVariables>(CreateSessionDocument, options);
      }
export type CreateSessionMutationHookResult = ReturnType<typeof useCreateSessionMutation>;
export type CreateSessionMutationResult = Apollo.MutationResult<CreateSessionMutation>;
export type CreateSessionMutationOptions = Apollo.BaseMutationOptions<CreateSessionMutation, CreateSessionMutationVariables>;
export const UpdateSessionDocument = gql`
    mutation UpdateSession($id: ID!, $input: UpdateSessionInput!) {
  updateSession(id: $id, input: $input) {
    id
    name
    workoutType
    date
    startTime
    endTime
    gymArea
    note
    status
  }
}
    `;
export type UpdateSessionMutationFn = Apollo.MutationFunction<UpdateSessionMutation, UpdateSessionMutationVariables>;

/**
 * __useUpdateSessionMutation__
 *
 * To run a mutation, you first call `useUpdateSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSessionMutation, { data, loading, error }] = useUpdateSessionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSessionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSessionMutation, UpdateSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSessionMutation, UpdateSessionMutationVariables>(UpdateSessionDocument, options);
      }
export type UpdateSessionMutationHookResult = ReturnType<typeof useUpdateSessionMutation>;
export type UpdateSessionMutationResult = Apollo.MutationResult<UpdateSessionMutation>;
export type UpdateSessionMutationOptions = Apollo.BaseMutationOptions<UpdateSessionMutation, UpdateSessionMutationVariables>;
export const CancelSessionDocument = gql`
    mutation CancelSession($id: ID!) {
  cancelSession(id: $id)
}
    `;
export type CancelSessionMutationFn = Apollo.MutationFunction<CancelSessionMutation, CancelSessionMutationVariables>;

/**
 * __useCancelSessionMutation__
 *
 * To run a mutation, you first call `useCancelSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelSessionMutation, { data, loading, error }] = useCancelSessionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCancelSessionMutation(baseOptions?: Apollo.MutationHookOptions<CancelSessionMutation, CancelSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelSessionMutation, CancelSessionMutationVariables>(CancelSessionDocument, options);
      }
export type CancelSessionMutationHookResult = ReturnType<typeof useCancelSessionMutation>;
export type CancelSessionMutationResult = Apollo.MutationResult<CancelSessionMutation>;
export type CancelSessionMutationOptions = Apollo.BaseMutationOptions<CancelSessionMutation, CancelSessionMutationVariables>;
export const CompleteSessionDocument = gql`
    mutation CompleteSession($input: CreateSessionLogInput!) {
  completeSession(input: $input) {
    id
    sessionId
    clientId
    coachId
    weight
    clientConfirmed
    coachConfirmed
    notes
    completedAt
  }
}
    `;
export type CompleteSessionMutationFn = Apollo.MutationFunction<CompleteSessionMutation, CompleteSessionMutationVariables>;

/**
 * __useCompleteSessionMutation__
 *
 * To run a mutation, you first call `useCompleteSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeSessionMutation, { data, loading, error }] = useCompleteSessionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCompleteSessionMutation(baseOptions?: Apollo.MutationHookOptions<CompleteSessionMutation, CompleteSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CompleteSessionMutation, CompleteSessionMutationVariables>(CompleteSessionDocument, options);
      }
export type CompleteSessionMutationHookResult = ReturnType<typeof useCompleteSessionMutation>;
export type CompleteSessionMutationResult = Apollo.MutationResult<CompleteSessionMutation>;
export type CompleteSessionMutationOptions = Apollo.BaseMutationOptions<CompleteSessionMutation, CompleteSessionMutationVariables>;
export const ConfirmSessionCompletionDocument = gql`
    mutation ConfirmSessionCompletion($input: ConfirmSessionCompletionInput!) {
  confirmSessionCompletion(input: $input) {
    id
    clientConfirmed
    coachConfirmed
  }
}
    `;
export type ConfirmSessionCompletionMutationFn = Apollo.MutationFunction<ConfirmSessionCompletionMutation, ConfirmSessionCompletionMutationVariables>;

/**
 * __useConfirmSessionCompletionMutation__
 *
 * To run a mutation, you first call `useConfirmSessionCompletionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfirmSessionCompletionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [confirmSessionCompletionMutation, { data, loading, error }] = useConfirmSessionCompletionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useConfirmSessionCompletionMutation(baseOptions?: Apollo.MutationHookOptions<ConfirmSessionCompletionMutation, ConfirmSessionCompletionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfirmSessionCompletionMutation, ConfirmSessionCompletionMutationVariables>(ConfirmSessionCompletionDocument, options);
      }
export type ConfirmSessionCompletionMutationHookResult = ReturnType<typeof useConfirmSessionCompletionMutation>;
export type ConfirmSessionCompletionMutationResult = Apollo.MutationResult<ConfirmSessionCompletionMutation>;
export type ConfirmSessionCompletionMutationOptions = Apollo.BaseMutationOptions<ConfirmSessionCompletionMutation, ConfirmSessionCompletionMutationVariables>;
export const ClientConfirmWeightDocument = gql`
    mutation ClientConfirmWeight($sessionLogId: ID!) {
  clientConfirmWeight(sessionLogId: $sessionLogId) {
    id
    clientConfirmed
    coachConfirmed
  }
}
    `;
export type ClientConfirmWeightMutationFn = Apollo.MutationFunction<ClientConfirmWeightMutation, ClientConfirmWeightMutationVariables>;

/**
 * __useClientConfirmWeightMutation__
 *
 * To run a mutation, you first call `useClientConfirmWeightMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClientConfirmWeightMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clientConfirmWeightMutation, { data, loading, error }] = useClientConfirmWeightMutation({
 *   variables: {
 *      sessionLogId: // value for 'sessionLogId'
 *   },
 * });
 */
export function useClientConfirmWeightMutation(baseOptions?: Apollo.MutationHookOptions<ClientConfirmWeightMutation, ClientConfirmWeightMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ClientConfirmWeightMutation, ClientConfirmWeightMutationVariables>(ClientConfirmWeightDocument, options);
      }
export type ClientConfirmWeightMutationHookResult = ReturnType<typeof useClientConfirmWeightMutation>;
export type ClientConfirmWeightMutationResult = Apollo.MutationResult<ClientConfirmWeightMutation>;
export type ClientConfirmWeightMutationOptions = Apollo.BaseMutationOptions<ClientConfirmWeightMutation, ClientConfirmWeightMutationVariables>;
export const CreateGoalDocument = gql`
    mutation CreateGoal($input: CreateGoalInput!) {
  createGoal(input: $input) {
    id
    clientId
    goalType
    title
    description
    targetWeight
    currentWeight
    targetDate
    status
    createdAt
  }
}
    `;
export type CreateGoalMutationFn = Apollo.MutationFunction<CreateGoalMutation, CreateGoalMutationVariables>;

/**
 * __useCreateGoalMutation__
 *
 * To run a mutation, you first call `useCreateGoalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGoalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGoalMutation, { data, loading, error }] = useCreateGoalMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGoalMutation(baseOptions?: Apollo.MutationHookOptions<CreateGoalMutation, CreateGoalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGoalMutation, CreateGoalMutationVariables>(CreateGoalDocument, options);
      }
export type CreateGoalMutationHookResult = ReturnType<typeof useCreateGoalMutation>;
export type CreateGoalMutationResult = Apollo.MutationResult<CreateGoalMutation>;
export type CreateGoalMutationOptions = Apollo.BaseMutationOptions<CreateGoalMutation, CreateGoalMutationVariables>;
export const UpdateGoalDocument = gql`
    mutation UpdateGoal($id: ID!, $input: UpdateGoalInput!) {
  updateGoal(id: $id, input: $input) {
    id
    goalType
    title
    description
    targetWeight
    currentWeight
    targetDate
    status
  }
}
    `;
export type UpdateGoalMutationFn = Apollo.MutationFunction<UpdateGoalMutation, UpdateGoalMutationVariables>;

/**
 * __useUpdateGoalMutation__
 *
 * To run a mutation, you first call `useUpdateGoalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGoalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGoalMutation, { data, loading, error }] = useUpdateGoalMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateGoalMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGoalMutation, UpdateGoalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGoalMutation, UpdateGoalMutationVariables>(UpdateGoalDocument, options);
      }
export type UpdateGoalMutationHookResult = ReturnType<typeof useUpdateGoalMutation>;
export type UpdateGoalMutationResult = Apollo.MutationResult<UpdateGoalMutation>;
export type UpdateGoalMutationOptions = Apollo.BaseMutationOptions<UpdateGoalMutation, UpdateGoalMutationVariables>;
export const DeleteGoalDocument = gql`
    mutation DeleteGoal($id: ID!) {
  deleteGoal(id: $id)
}
    `;
export type DeleteGoalMutationFn = Apollo.MutationFunction<DeleteGoalMutation, DeleteGoalMutationVariables>;

/**
 * __useDeleteGoalMutation__
 *
 * To run a mutation, you first call `useDeleteGoalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGoalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGoalMutation, { data, loading, error }] = useDeleteGoalMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGoalMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGoalMutation, DeleteGoalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGoalMutation, DeleteGoalMutationVariables>(DeleteGoalDocument, options);
      }
export type DeleteGoalMutationHookResult = ReturnType<typeof useDeleteGoalMutation>;
export type DeleteGoalMutationResult = Apollo.MutationResult<DeleteGoalMutation>;
export type DeleteGoalMutationOptions = Apollo.BaseMutationOptions<DeleteGoalMutation, DeleteGoalMutationVariables>;
export const PurchaseMembershipDocument = gql`
    mutation PurchaseMembership($input: PurchaseMembershipInput!) {
  purchaseMembership(input: $input) {
    id
    clientId
    membershipId
    membership {
      id
      name
      monthlyPrice
      features
    }
    priceAtPurchase
    startedAt
    expiresAt
    status
  }
}
    `;
export type PurchaseMembershipMutationFn = Apollo.MutationFunction<PurchaseMembershipMutation, PurchaseMembershipMutationVariables>;

/**
 * __usePurchaseMembershipMutation__
 *
 * To run a mutation, you first call `usePurchaseMembershipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePurchaseMembershipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [purchaseMembershipMutation, { data, loading, error }] = usePurchaseMembershipMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePurchaseMembershipMutation(baseOptions?: Apollo.MutationHookOptions<PurchaseMembershipMutation, PurchaseMembershipMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PurchaseMembershipMutation, PurchaseMembershipMutationVariables>(PurchaseMembershipDocument, options);
      }
export type PurchaseMembershipMutationHookResult = ReturnType<typeof usePurchaseMembershipMutation>;
export type PurchaseMembershipMutationResult = Apollo.MutationResult<PurchaseMembershipMutation>;
export type PurchaseMembershipMutationOptions = Apollo.BaseMutationOptions<PurchaseMembershipMutation, PurchaseMembershipMutationVariables>;
export const CancelMembershipDocument = gql`
    mutation CancelMembership($transactionId: ID!) {
  cancelMembership(transactionId: $transactionId)
}
    `;
export type CancelMembershipMutationFn = Apollo.MutationFunction<CancelMembershipMutation, CancelMembershipMutationVariables>;

/**
 * __useCancelMembershipMutation__
 *
 * To run a mutation, you first call `useCancelMembershipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelMembershipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelMembershipMutation, { data, loading, error }] = useCancelMembershipMutation({
 *   variables: {
 *      transactionId: // value for 'transactionId'
 *   },
 * });
 */
export function useCancelMembershipMutation(baseOptions?: Apollo.MutationHookOptions<CancelMembershipMutation, CancelMembershipMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelMembershipMutation, CancelMembershipMutationVariables>(CancelMembershipDocument, options);
      }
export type CancelMembershipMutationHookResult = ReturnType<typeof useCancelMembershipMutation>;
export type CancelMembershipMutationResult = Apollo.MutationResult<CancelMembershipMutation>;
export type CancelMembershipMutationOptions = Apollo.BaseMutationOptions<CancelMembershipMutation, CancelMembershipMutationVariables>;
export const GetUpcomingSessionsDocument = gql`
    query GetUpcomingSessions {
  getUpcomingSessions {
    id
    coachId
    coach {
      id
      firstName
      lastName
    }
    clientsIds
    clients {
      id
      firstName
      lastName
      email
    }
    name
    workoutType
    date
    startTime
    endTime
    gymArea
    note
    status
    createdAt
  }
}
    `;

/**
 * __useGetUpcomingSessionsQuery__
 *
 * To run a query within a React component, call `useGetUpcomingSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUpcomingSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUpcomingSessionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUpcomingSessionsQuery(baseOptions?: Apollo.QueryHookOptions<GetUpcomingSessionsQuery, GetUpcomingSessionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUpcomingSessionsQuery, GetUpcomingSessionsQueryVariables>(GetUpcomingSessionsDocument, options);
      }
export function useGetUpcomingSessionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUpcomingSessionsQuery, GetUpcomingSessionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUpcomingSessionsQuery, GetUpcomingSessionsQueryVariables>(GetUpcomingSessionsDocument, options);
        }
export function useGetUpcomingSessionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUpcomingSessionsQuery, GetUpcomingSessionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUpcomingSessionsQuery, GetUpcomingSessionsQueryVariables>(GetUpcomingSessionsDocument, options);
        }
export type GetUpcomingSessionsQueryHookResult = ReturnType<typeof useGetUpcomingSessionsQuery>;
export type GetUpcomingSessionsLazyQueryHookResult = ReturnType<typeof useGetUpcomingSessionsLazyQuery>;
export type GetUpcomingSessionsSuspenseQueryHookResult = ReturnType<typeof useGetUpcomingSessionsSuspenseQuery>;
export type GetUpcomingSessionsQueryResult = Apollo.QueryResult<GetUpcomingSessionsQuery, GetUpcomingSessionsQueryVariables>;
export const GetCoachSessionsDocument = gql`
    query GetCoachSessions($coachId: ID!, $status: SessionStatus) {
  getCoachSessions(coachId: $coachId, status: $status) {
    id
    coachId
    clientsIds
    clients {
      id
      firstName
      lastName
      email
    }
    name
    workoutType
    date
    startTime
    endTime
    gymArea
    note
    status
    createdAt
  }
}
    `;

/**
 * __useGetCoachSessionsQuery__
 *
 * To run a query within a React component, call `useGetCoachSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCoachSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCoachSessionsQuery({
 *   variables: {
 *      coachId: // value for 'coachId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetCoachSessionsQuery(baseOptions: Apollo.QueryHookOptions<GetCoachSessionsQuery, GetCoachSessionsQueryVariables> & ({ variables: GetCoachSessionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCoachSessionsQuery, GetCoachSessionsQueryVariables>(GetCoachSessionsDocument, options);
      }
export function useGetCoachSessionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCoachSessionsQuery, GetCoachSessionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCoachSessionsQuery, GetCoachSessionsQueryVariables>(GetCoachSessionsDocument, options);
        }
export function useGetCoachSessionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCoachSessionsQuery, GetCoachSessionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCoachSessionsQuery, GetCoachSessionsQueryVariables>(GetCoachSessionsDocument, options);
        }
export type GetCoachSessionsQueryHookResult = ReturnType<typeof useGetCoachSessionsQuery>;
export type GetCoachSessionsLazyQueryHookResult = ReturnType<typeof useGetCoachSessionsLazyQuery>;
export type GetCoachSessionsSuspenseQueryHookResult = ReturnType<typeof useGetCoachSessionsSuspenseQuery>;
export type GetCoachSessionsQueryResult = Apollo.QueryResult<GetCoachSessionsQuery, GetCoachSessionsQueryVariables>;
export const GetClientSessionsDocument = gql`
    query GetClientSessions($clientId: ID!, $status: SessionStatus) {
  getClientSessions(clientId: $clientId, status: $status) {
    id
    coachId
    coach {
      id
      firstName
      lastName
    }
    name
    workoutType
    date
    startTime
    endTime
    gymArea
    note
    status
    createdAt
  }
}
    `;

/**
 * __useGetClientSessionsQuery__
 *
 * To run a query within a React component, call `useGetClientSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClientSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClientSessionsQuery({
 *   variables: {
 *      clientId: // value for 'clientId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetClientSessionsQuery(baseOptions: Apollo.QueryHookOptions<GetClientSessionsQuery, GetClientSessionsQueryVariables> & ({ variables: GetClientSessionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClientSessionsQuery, GetClientSessionsQueryVariables>(GetClientSessionsDocument, options);
      }
export function useGetClientSessionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClientSessionsQuery, GetClientSessionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClientSessionsQuery, GetClientSessionsQueryVariables>(GetClientSessionsDocument, options);
        }
export function useGetClientSessionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClientSessionsQuery, GetClientSessionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetClientSessionsQuery, GetClientSessionsQueryVariables>(GetClientSessionsDocument, options);
        }
export type GetClientSessionsQueryHookResult = ReturnType<typeof useGetClientSessionsQuery>;
export type GetClientSessionsLazyQueryHookResult = ReturnType<typeof useGetClientSessionsLazyQuery>;
export type GetClientSessionsSuspenseQueryHookResult = ReturnType<typeof useGetClientSessionsSuspenseQuery>;
export type GetClientSessionsQueryResult = Apollo.QueryResult<GetClientSessionsQuery, GetClientSessionsQueryVariables>;
export const GetSessionDocument = gql`
    query GetSession($id: ID!) {
  getSession(id: $id) {
    id
    coachId
    coach {
      id
      firstName
      lastName
      email
    }
    clientsIds
    clients {
      id
      firstName
      lastName
      email
    }
    name
    workoutType
    date
    startTime
    endTime
    gymArea
    note
    status
    createdAt
  }
}
    `;

/**
 * __useGetSessionQuery__
 *
 * To run a query within a React component, call `useGetSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetSessionQuery(baseOptions: Apollo.QueryHookOptions<GetSessionQuery, GetSessionQueryVariables> & ({ variables: GetSessionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSessionQuery, GetSessionQueryVariables>(GetSessionDocument, options);
      }
export function useGetSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSessionQuery, GetSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSessionQuery, GetSessionQueryVariables>(GetSessionDocument, options);
        }
export function useGetSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSessionQuery, GetSessionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSessionQuery, GetSessionQueryVariables>(GetSessionDocument, options);
        }
export type GetSessionQueryHookResult = ReturnType<typeof useGetSessionQuery>;
export type GetSessionLazyQueryHookResult = ReturnType<typeof useGetSessionLazyQuery>;
export type GetSessionSuspenseQueryHookResult = ReturnType<typeof useGetSessionSuspenseQuery>;
export type GetSessionQueryResult = Apollo.QueryResult<GetSessionQuery, GetSessionQueryVariables>;
export const GetSessionLogsDocument = gql`
    query GetSessionLogs($clientId: ID!) {
  getSessionLogs(clientId: $clientId) {
    id
    sessionId
    session {
      id
      name
      date
    }
    weight
    clientConfirmed
    coachConfirmed
    notes
    completedAt
  }
}
    `;

/**
 * __useGetSessionLogsQuery__
 *
 * To run a query within a React component, call `useGetSessionLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionLogsQuery({
 *   variables: {
 *      clientId: // value for 'clientId'
 *   },
 * });
 */
export function useGetSessionLogsQuery(baseOptions: Apollo.QueryHookOptions<GetSessionLogsQuery, GetSessionLogsQueryVariables> & ({ variables: GetSessionLogsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSessionLogsQuery, GetSessionLogsQueryVariables>(GetSessionLogsDocument, options);
      }
export function useGetSessionLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSessionLogsQuery, GetSessionLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSessionLogsQuery, GetSessionLogsQueryVariables>(GetSessionLogsDocument, options);
        }
export function useGetSessionLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSessionLogsQuery, GetSessionLogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSessionLogsQuery, GetSessionLogsQueryVariables>(GetSessionLogsDocument, options);
        }
export type GetSessionLogsQueryHookResult = ReturnType<typeof useGetSessionLogsQuery>;
export type GetSessionLogsLazyQueryHookResult = ReturnType<typeof useGetSessionLogsLazyQuery>;
export type GetSessionLogsSuspenseQueryHookResult = ReturnType<typeof useGetSessionLogsSuspenseQuery>;
export type GetSessionLogsQueryResult = Apollo.QueryResult<GetSessionLogsQuery, GetSessionLogsQueryVariables>;
export const GetWeightProgressDocument = gql`
    query GetWeightProgress($clientId: ID!, $goalId: ID) {
  getWeightProgress(clientId: $clientId, goalId: $goalId) {
    id
    weight
    completedAt
    session {
      id
      name
      date
    }
  }
}
    `;

/**
 * __useGetWeightProgressQuery__
 *
 * To run a query within a React component, call `useGetWeightProgressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWeightProgressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWeightProgressQuery({
 *   variables: {
 *      clientId: // value for 'clientId'
 *      goalId: // value for 'goalId'
 *   },
 * });
 */
export function useGetWeightProgressQuery(baseOptions: Apollo.QueryHookOptions<GetWeightProgressQuery, GetWeightProgressQueryVariables> & ({ variables: GetWeightProgressQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWeightProgressQuery, GetWeightProgressQueryVariables>(GetWeightProgressDocument, options);
      }
export function useGetWeightProgressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWeightProgressQuery, GetWeightProgressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWeightProgressQuery, GetWeightProgressQueryVariables>(GetWeightProgressDocument, options);
        }
export function useGetWeightProgressSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWeightProgressQuery, GetWeightProgressQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWeightProgressQuery, GetWeightProgressQueryVariables>(GetWeightProgressDocument, options);
        }
export type GetWeightProgressQueryHookResult = ReturnType<typeof useGetWeightProgressQuery>;
export type GetWeightProgressLazyQueryHookResult = ReturnType<typeof useGetWeightProgressLazyQuery>;
export type GetWeightProgressSuspenseQueryHookResult = ReturnType<typeof useGetWeightProgressSuspenseQuery>;
export type GetWeightProgressQueryResult = Apollo.QueryResult<GetWeightProgressQuery, GetWeightProgressQueryVariables>;
export const GetGoalsDocument = gql`
    query GetGoals($clientId: ID!, $status: GoalStatus) {
  getGoals(clientId: $clientId, status: $status) {
    id
    clientId
    goalType
    title
    description
    targetWeight
    currentWeight
    targetDate
    status
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetGoalsQuery__
 *
 * To run a query within a React component, call `useGetGoalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGoalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGoalsQuery({
 *   variables: {
 *      clientId: // value for 'clientId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetGoalsQuery(baseOptions: Apollo.QueryHookOptions<GetGoalsQuery, GetGoalsQueryVariables> & ({ variables: GetGoalsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGoalsQuery, GetGoalsQueryVariables>(GetGoalsDocument, options);
      }
export function useGetGoalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGoalsQuery, GetGoalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGoalsQuery, GetGoalsQueryVariables>(GetGoalsDocument, options);
        }
export function useGetGoalsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGoalsQuery, GetGoalsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGoalsQuery, GetGoalsQueryVariables>(GetGoalsDocument, options);
        }
export type GetGoalsQueryHookResult = ReturnType<typeof useGetGoalsQuery>;
export type GetGoalsLazyQueryHookResult = ReturnType<typeof useGetGoalsLazyQuery>;
export type GetGoalsSuspenseQueryHookResult = ReturnType<typeof useGetGoalsSuspenseQuery>;
export type GetGoalsQueryResult = Apollo.QueryResult<GetGoalsQuery, GetGoalsQueryVariables>;
export const GetGoalDocument = gql`
    query GetGoal($id: ID!) {
  getGoal(id: $id) {
    id
    clientId
    goalType
    title
    description
    targetWeight
    currentWeight
    targetDate
    status
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetGoalQuery__
 *
 * To run a query within a React component, call `useGetGoalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGoalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGoalQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetGoalQuery(baseOptions: Apollo.QueryHookOptions<GetGoalQuery, GetGoalQueryVariables> & ({ variables: GetGoalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGoalQuery, GetGoalQueryVariables>(GetGoalDocument, options);
      }
export function useGetGoalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGoalQuery, GetGoalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGoalQuery, GetGoalQueryVariables>(GetGoalDocument, options);
        }
export function useGetGoalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGoalQuery, GetGoalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGoalQuery, GetGoalQueryVariables>(GetGoalDocument, options);
        }
export type GetGoalQueryHookResult = ReturnType<typeof useGetGoalQuery>;
export type GetGoalLazyQueryHookResult = ReturnType<typeof useGetGoalLazyQuery>;
export type GetGoalSuspenseQueryHookResult = ReturnType<typeof useGetGoalSuspenseQuery>;
export type GetGoalQueryResult = Apollo.QueryResult<GetGoalQuery, GetGoalQueryVariables>;
export const GetWeightProgressChartDocument = gql`
    query GetWeightProgressChart($clientId: ID!, $goalId: ID) {
  getWeightProgressChart(clientId: $clientId, goalId: $goalId) {
    date
    weight
    sessionId
    sessionLogId
  }
}
    `;

/**
 * __useGetWeightProgressChartQuery__
 *
 * To run a query within a React component, call `useGetWeightProgressChartQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWeightProgressChartQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWeightProgressChartQuery({
 *   variables: {
 *      clientId: // value for 'clientId'
 *      goalId: // value for 'goalId'
 *   },
 * });
 */
export function useGetWeightProgressChartQuery(baseOptions: Apollo.QueryHookOptions<GetWeightProgressChartQuery, GetWeightProgressChartQueryVariables> & ({ variables: GetWeightProgressChartQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWeightProgressChartQuery, GetWeightProgressChartQueryVariables>(GetWeightProgressChartDocument, options);
      }
export function useGetWeightProgressChartLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWeightProgressChartQuery, GetWeightProgressChartQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWeightProgressChartQuery, GetWeightProgressChartQueryVariables>(GetWeightProgressChartDocument, options);
        }
export function useGetWeightProgressChartSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWeightProgressChartQuery, GetWeightProgressChartQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWeightProgressChartQuery, GetWeightProgressChartQueryVariables>(GetWeightProgressChartDocument, options);
        }
export type GetWeightProgressChartQueryHookResult = ReturnType<typeof useGetWeightProgressChartQuery>;
export type GetWeightProgressChartLazyQueryHookResult = ReturnType<typeof useGetWeightProgressChartLazyQuery>;
export type GetWeightProgressChartSuspenseQueryHookResult = ReturnType<typeof useGetWeightProgressChartSuspenseQuery>;
export type GetWeightProgressChartQueryResult = Apollo.QueryResult<GetWeightProgressChartQuery, GetWeightProgressChartQueryVariables>;
export const GetMembershipsDocument = gql`
    query GetMemberships($status: MembershipStatus) {
  getMemberships(status: $status) {
    id
    name
    monthlyPrice
    description
    features
    status
    durationType
  }
}
    `;

/**
 * __useGetMembershipsQuery__
 *
 * To run a query within a React component, call `useGetMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMembershipsQuery({
 *   variables: {
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetMembershipsQuery(baseOptions?: Apollo.QueryHookOptions<GetMembershipsQuery, GetMembershipsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMembershipsQuery, GetMembershipsQueryVariables>(GetMembershipsDocument, options);
      }
export function useGetMembershipsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMembershipsQuery, GetMembershipsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMembershipsQuery, GetMembershipsQueryVariables>(GetMembershipsDocument, options);
        }
export function useGetMembershipsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMembershipsQuery, GetMembershipsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMembershipsQuery, GetMembershipsQueryVariables>(GetMembershipsDocument, options);
        }
export type GetMembershipsQueryHookResult = ReturnType<typeof useGetMembershipsQuery>;
export type GetMembershipsLazyQueryHookResult = ReturnType<typeof useGetMembershipsLazyQuery>;
export type GetMembershipsSuspenseQueryHookResult = ReturnType<typeof useGetMembershipsSuspenseQuery>;
export type GetMembershipsQueryResult = Apollo.QueryResult<GetMembershipsQuery, GetMembershipsQueryVariables>;
export const GetMembershipDocument = gql`
    query GetMembership($id: ID!) {
  getMembership(id: $id) {
    id
    name
    monthlyPrice
    description
    features
    status
    durationType
  }
}
    `;

/**
 * __useGetMembershipQuery__
 *
 * To run a query within a React component, call `useGetMembershipQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMembershipQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMembershipQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetMembershipQuery(baseOptions: Apollo.QueryHookOptions<GetMembershipQuery, GetMembershipQueryVariables> & ({ variables: GetMembershipQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMembershipQuery, GetMembershipQueryVariables>(GetMembershipDocument, options);
      }
export function useGetMembershipLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMembershipQuery, GetMembershipQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMembershipQuery, GetMembershipQueryVariables>(GetMembershipDocument, options);
        }
export function useGetMembershipSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMembershipQuery, GetMembershipQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMembershipQuery, GetMembershipQueryVariables>(GetMembershipDocument, options);
        }
export type GetMembershipQueryHookResult = ReturnType<typeof useGetMembershipQuery>;
export type GetMembershipLazyQueryHookResult = ReturnType<typeof useGetMembershipLazyQuery>;
export type GetMembershipSuspenseQueryHookResult = ReturnType<typeof useGetMembershipSuspenseQuery>;
export type GetMembershipQueryResult = Apollo.QueryResult<GetMembershipQuery, GetMembershipQueryVariables>;
export const GetCurrentMembershipDocument = gql`
    query GetCurrentMembership {
  getCurrentMembership {
    id
    clientId
    membershipId
    membership {
      id
      name
      monthlyPrice
      description
      features
      durationType
    }
    priceAtPurchase
    startedAt
    expiresAt
    status
  }
}
    `;

/**
 * __useGetCurrentMembershipQuery__
 *
 * To run a query within a React component, call `useGetCurrentMembershipQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCurrentMembershipQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCurrentMembershipQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCurrentMembershipQuery(baseOptions?: Apollo.QueryHookOptions<GetCurrentMembershipQuery, GetCurrentMembershipQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCurrentMembershipQuery, GetCurrentMembershipQueryVariables>(GetCurrentMembershipDocument, options);
      }
export function useGetCurrentMembershipLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCurrentMembershipQuery, GetCurrentMembershipQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCurrentMembershipQuery, GetCurrentMembershipQueryVariables>(GetCurrentMembershipDocument, options);
        }
export function useGetCurrentMembershipSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCurrentMembershipQuery, GetCurrentMembershipQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCurrentMembershipQuery, GetCurrentMembershipQueryVariables>(GetCurrentMembershipDocument, options);
        }
export type GetCurrentMembershipQueryHookResult = ReturnType<typeof useGetCurrentMembershipQuery>;
export type GetCurrentMembershipLazyQueryHookResult = ReturnType<typeof useGetCurrentMembershipLazyQuery>;
export type GetCurrentMembershipSuspenseQueryHookResult = ReturnType<typeof useGetCurrentMembershipSuspenseQuery>;
export type GetCurrentMembershipQueryResult = Apollo.QueryResult<GetCurrentMembershipQuery, GetCurrentMembershipQueryVariables>;
export const GetUsersDocument = gql`
    query GetUsers($role: RoleType) {
  getUsers(role: $role) {
    id
    firstName
    lastName
    email
    role
    phoneNumber
    coachDetails {
      specialization
      ratings
      yearsOfExperience
    }
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *      role: // value for 'role'
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;