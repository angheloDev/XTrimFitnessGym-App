# GraphQL Code Generator Setup

This project uses GraphQL Code Generator to automatically generate TypeScript types from your GraphQL schema and operations.

## Prerequisites

1. **API Server Running**: The codegen fetches the schema via introspection from your running API server.
2. **API URL**: Make sure your API server is accessible at the URL specified in `codegen.ts` (default: `http://localhost:8080/graphql`)

## Usage

### Generate Types (One-time)

```bash
npm run generate
```

This will:
- Fetch the GraphQL schema from your running API server
- Scan all GraphQL operations in `graphql/**/*.{ts,tsx}` and `app/**/*.{ts,tsx}`
- Generate TypeScript types in `graphql/generated/types.ts`

### Watch Mode (Development)

```bash
npm run generate:watch
```

This will watch for changes to your GraphQL operations and automatically regenerate types.

## Configuration

The configuration is in `codegen.ts`. You can customize:

- **Schema Source**: Change the `schema` field to point to your API URL or local schema files
- **Output Location**: Modify the `generates` path to change where types are generated
- **Plugins**: Add or remove plugins to customize the generated code

## Using Generated Types

After running codegen, import types from the generated file:

```typescript
import { 
  LoginMutation, 
  LoginMutationVariables,
  CreateUserMutation,
  CreateUserMutationVariables,
  User,
  RoleType 
} from '@/graphql/generated/types';
```

Then use them in your components:

```typescript
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION } from '@/graphql/mutations';
import { LoginMutation, LoginMutationVariables } from '@/graphql/generated/types';

const [login, { loading }] = useMutation<LoginMutation, LoginMutationVariables>(
  LOGIN_MUTATION,
  {
    onCompleted: (data) => {
      // data is now fully typed!
      const user = data.login.user;
    },
  }
);
```

## Alternative: Using Schema Files from API Repo

If you want to generate types without running the API server, you can use the alternative config:

```bash
npm run generate:schema
```

This uses `codegen-schema-files.ts` which references schema files directly from the API repository.

**Prerequisites:**
- The API repository must be in a sibling directory: `../XTrimFitGym-Api`
- Update the path in `codegen-schema-files.ts` if your API repo is in a different location

## Troubleshooting

### Error: "Unable to fetch schema"
- Make sure your API server is running
- Check that the API URL in `codegen.ts` is correct
- Verify the API server allows introspection queries

### Error: "Cannot find module"
- Run `npm run generate` to create the types file
- Make sure the generated file exists at `graphql/generated/types.ts`

### Schema Out of Sync
- Run `npm run generate` after any schema changes in the API
- Consider using watch mode during development: `npm run generate:watch`

