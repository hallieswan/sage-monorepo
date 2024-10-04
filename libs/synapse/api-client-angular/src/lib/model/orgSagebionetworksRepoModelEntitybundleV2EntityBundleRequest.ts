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

/**
 * Specifies what fields to include in an EntityBundle
 */
export interface OrgSagebionetworksRepoModelEntitybundleV2EntityBundleRequest {
  includeEntity?: boolean;
  includeAnnotations?: boolean;
  includePermissions?: boolean;
  includeEntityPath?: boolean;
  includeHasChildren?: boolean;
  includeAccessControlList?: boolean;
  includeFileHandles?: boolean;
  includeTableBundle?: boolean;
  includeRootWikiId?: boolean;
  includeBenefactorACL?: boolean;
  includeDOIAssociation?: boolean;
  includeFileName?: boolean;
  includeThreadCount?: boolean;
  includeRestrictionInformation?: boolean;
  includeActivity?: boolean;
}