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
import { OrgSagebionetworksRepoModelMessageComment } from './orgSagebionetworksRepoModelMessageComment';
import { OrgSagebionetworksRepoModelMessageMessageToUser } from './orgSagebionetworksRepoModelMessageMessageToUser';

/**
 * Contains fields common to all messages and comments
 */
/**
 * @type OrgSagebionetworksRepoModelMessageMessageContent
 * Contains fields common to all messages and comments
 * @export
 */
export type OrgSagebionetworksRepoModelMessageMessageContent =
  | OrgSagebionetworksRepoModelMessageComment
  | OrgSagebionetworksRepoModelMessageMessageToUser;