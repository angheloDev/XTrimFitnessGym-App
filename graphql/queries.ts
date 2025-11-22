import { gql } from '@apollo/client';

// Session queries
export const GET_UPCOMING_SESSIONS_QUERY = gql`
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

export const GET_COACH_SESSIONS_QUERY = gql`
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

export const GET_CLIENT_SESSIONS_QUERY = gql`
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

export const GET_SESSION_QUERY = gql`
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

export const GET_SESSION_LOGS_QUERY = gql`
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

export const GET_WEIGHT_PROGRESS_QUERY = gql`
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

// Goal queries
export const GET_GOALS_QUERY = gql`
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

export const GET_GOAL_QUERY = gql`
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

export const GET_WEIGHT_PROGRESS_CHART_QUERY = gql`
	query GetWeightProgressChart($clientId: ID!, $goalId: ID) {
		getWeightProgressChart(clientId: $clientId, goalId: $goalId) {
			date
			weight
			sessionId
			sessionLogId
		}
	}
`;

// Membership queries
export const GET_MEMBERSHIPS_QUERY = gql`
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

export const GET_MEMBERSHIP_QUERY = gql`
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

export const GET_CURRENT_MEMBERSHIP_QUERY = gql`
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

// User queries
export const GET_USERS_QUERY = gql`
	query GetUsers($role: RoleType) {
		getUsers(role: $role) {
			id
			firstName
			lastName
			email
			role
			phoneNumber
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
				clientLimit
			}
		}
	}
`;

// Coach Request queries
export const GET_PENDING_COACH_REQUESTS_QUERY = gql`
	query GetPendingCoachRequests {
		getPendingCoachRequests {
			id
			clientId
			client {
				id
				firstName
				lastName
				email
			}
			coachId
			coach {
				id
				firstName
				lastName
			}
			status
			message
			createdAt
			updatedAt
		}
	}
`;

export const GET_COACH_REQUESTS_QUERY = gql`
	query GetCoachRequests($coachId: ID!, $status: CoachRequestStatus) {
		getCoachRequests(coachId: $coachId, status: $status) {
			id
			clientId
			client {
				id
				firstName
				lastName
				email
			}
			coachId
			coach {
				id
				firstName
				lastName
			}
			status
			message
			createdAt
			updatedAt
		}
	}
`;

export const GET_CLIENT_REQUESTS_QUERY = gql`
	query GetClientRequests($clientId: ID!, $status: CoachRequestStatus) {
		getClientRequests(clientId: $clientId, status: $status) {
			id
			clientId
			client {
				id
				firstName
				lastName
				email
			}
			coachId
			coach {
				id
				firstName
				lastName
			}
			status
			message
			createdAt
			updatedAt
		}
	}
`;

