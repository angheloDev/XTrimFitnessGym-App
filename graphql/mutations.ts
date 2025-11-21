import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
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

export const CREATE_USER_MUTATION = gql`
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

// Session mutations
export const CREATE_SESSION_MUTATION = gql`
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

export const UPDATE_SESSION_MUTATION = gql`
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

export const CANCEL_SESSION_MUTATION = gql`
	mutation CancelSession($id: ID!) {
		cancelSession(id: $id)
	}
`;

export const COMPLETE_SESSION_MUTATION = gql`
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

export const CONFIRM_SESSION_COMPLETION_MUTATION = gql`
	mutation ConfirmSessionCompletion($input: ConfirmSessionCompletionInput!) {
		confirmSessionCompletion(input: $input) {
			id
			clientConfirmed
			coachConfirmed
		}
	}
`;

export const CLIENT_CONFIRM_WEIGHT_MUTATION = gql`
	mutation ClientConfirmWeight($sessionLogId: ID!) {
		clientConfirmWeight(sessionLogId: $sessionLogId) {
			id
			clientConfirmed
			coachConfirmed
		}
	}
`;

// Goal mutations
export const CREATE_GOAL_MUTATION = gql`
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

export const UPDATE_GOAL_MUTATION = gql`
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

export const DELETE_GOAL_MUTATION = gql`
	mutation DeleteGoal($id: ID!) {
		deleteGoal(id: $id)
	}
`;

// Membership mutations
export const PURCHASE_MEMBERSHIP_MUTATION = gql`
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

export const CANCEL_MEMBERSHIP_MUTATION = gql`
	mutation CancelMembership($transactionId: ID!) {
		cancelMembership(transactionId: $transactionId)
	}
`;

