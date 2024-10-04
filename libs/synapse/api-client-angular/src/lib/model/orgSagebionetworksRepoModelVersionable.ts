/**
 * Synapse REST API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { OrgSagebionetworksRepoModelTableDatasetCollection } from './orgSagebionetworksRepoModelTableDatasetCollection';
import { OrgSagebionetworksRepoModelTableEntityView } from './orgSagebionetworksRepoModelTableEntityView';
import { OrgSagebionetworksRepoModelTableMaterializedView } from './orgSagebionetworksRepoModelTableMaterializedView';
import { OrgSagebionetworksRepoModelTableVirtualTable } from './orgSagebionetworksRepoModelTableVirtualTable';
import { OrgSagebionetworksRepoModelSelfSignAccessRequirement } from './orgSagebionetworksRepoModelSelfSignAccessRequirement';
import { OrgSagebionetworksRepoModelTableTableEntity } from './orgSagebionetworksRepoModelTableTableEntity';
import { OrgSagebionetworksRepoModelLockAccessRequirement } from './orgSagebionetworksRepoModelLockAccessRequirement';
import { OrgSagebionetworksRepoModelTableDataset } from './orgSagebionetworksRepoModelTableDataset';
import { OrgSagebionetworksRepoModelTableSubmissionView } from './orgSagebionetworksRepoModelTableSubmissionView';
import { OrgSagebionetworksRepoModelFileEntity } from './orgSagebionetworksRepoModelFileEntity';
import { OrgSagebionetworksRepoModelEntityRef } from './orgSagebionetworksRepoModelEntityRef';
import { OrgSagebionetworksRepoModelManagedACTAccessRequirement } from './orgSagebionetworksRepoModelManagedACTAccessRequirement';
import { OrgSagebionetworksRepoModelACTAccessRequirement } from './orgSagebionetworksRepoModelACTAccessRequirement';
import { OrgSagebionetworksRepoModelRestrictableObjectDescriptor } from './orgSagebionetworksRepoModelRestrictableObjectDescriptor';
import { OrgSagebionetworksRepoModelTermsOfUseAccessRequirement } from './orgSagebionetworksRepoModelTermsOfUseAccessRequirement';
import { OrgSagebionetworksRepoModelPostMessageContentAccessRequirement } from './orgSagebionetworksRepoModelPostMessageContentAccessRequirement';

/**
 * JSON schema for Versionable interface
 */
/**
 * @type OrgSagebionetworksRepoModelVersionable
 * JSON schema for Versionable interface
 * @export
 */
export type OrgSagebionetworksRepoModelVersionable =
  | OrgSagebionetworksRepoModelACTAccessRequirement
  | OrgSagebionetworksRepoModelFileEntity
  | OrgSagebionetworksRepoModelLockAccessRequirement
  | OrgSagebionetworksRepoModelManagedACTAccessRequirement
  | OrgSagebionetworksRepoModelPostMessageContentAccessRequirement
  | OrgSagebionetworksRepoModelSelfSignAccessRequirement
  | OrgSagebionetworksRepoModelTableDataset
  | OrgSagebionetworksRepoModelTableDatasetCollection
  | OrgSagebionetworksRepoModelTableEntityView
  | OrgSagebionetworksRepoModelTableMaterializedView
  | OrgSagebionetworksRepoModelTableSubmissionView
  | OrgSagebionetworksRepoModelTableTableEntity
  | OrgSagebionetworksRepoModelTableVirtualTable
  | OrgSagebionetworksRepoModelTermsOfUseAccessRequirement;