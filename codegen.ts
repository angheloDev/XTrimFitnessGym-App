import type { CodegenConfig } from '@graphql-codegen/cli';

// Get API URL from environment variable or use default
// You can set API_URL environment variable or it will use localhost
// For production/CI, you might want to use: API_URL=http://your-api-url/graphql npm run generate
const apiUrl = process.env.API_URL ?? 'http://localhost:8000/graphql';
// const apiUrl = process.env.API_URL || 'http://localhost:8000/graphql';

const config: CodegenConfig = {
	// Schema source: Fetch from running API server via introspection
	//
	// Option 1: Use introspection (requires API server to be running)
	// This is the default - make sure your API server is running before generating types
	schema: apiUrl,

	// Option 2: Use schema files from API repository (uncomment to use)
	// Make sure the API repo is in a sibling directory: ../XTrimFitGym-Api
	// schema: '../XTrimFitGym-Api/src/graphql/**/*.graphql',
	// Documents: All GraphQL operations in the app
	documents: ['graphql/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
	// Output configuration
	generates: {
		'./graphql/generated/types.ts': {
			plugins: [
				'typescript',
				'typescript-operations',
				'typescript-react-apollo',
			],
			config: {
				// Use React hooks from @apollo/client/react
				reactApolloVersion: 3,
				withHooks: true,
				withComponent: false,
				withHOC: false,
				// Use the new Apollo Client v4 hooks location
				apolloClientVersion: 3,
				// Generate types for scalars
				scalars: {
					DateTime: 'string',
					Date: 'string',
				},
				// Naming conventions
				skipTypename: false,
				// Use const enums for better performance
				enumsAsTypes: true,
				// Generate input types
				skipDocumentsValidation: false,
			},
		},
	},
	// Ignore patterns
	ignoreNoDocuments: true,
};

export default config;
