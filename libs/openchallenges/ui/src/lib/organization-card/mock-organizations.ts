import { Organization } from '@sagebionetworks/openchallenges/api-client-angular';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    name: 'Awesome Org',
    description: 'This is an awesome organization',
    email: 'contact@example.org',
    login: 'awesome-org',
    websiteUrl: 'https://www.awesome-organization.org',
    avatarUrl: '',
    createdAt: '',
    updatedAt: '',
  },
  {
    name: 'DREAM',
    description: 'This is an awesome organization',
    email: 'contact@example.org',
    login: 'dream',
    websiteUrl: '',
    avatarUrl:
      'https://github.com/Sage-Bionetworks/rocc-app/raw/main/images/logo/dream.png',
    createdAt: '',
    updatedAt: '',
  },
  {
    name: 'Synapse',
    description: 'This is an awesome organization',
    email: 'contact@example.org',
    login: 'synapse',
    websiteUrl: '',
    avatarUrl:
      'https://github.com/Sage-Bionetworks/rocc-app/raw/main/images/logo/synapse.png',
    createdAt: '',
    updatedAt: '',
  },
];