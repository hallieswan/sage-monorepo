/**
 * OpenChallenges REST API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { EdamSection } from './edamSection';
import { EdamConceptSort } from './edamConceptSort';
import { EdamConceptDirection } from './edamConceptDirection';


/**
 * An EDAM concept search query.
 */
export interface EdamConceptSearchQuery { 
    /**
     * The page number.
     */
    pageNumber?: number;
    /**
     * The number of items in a single page.
     */
    pageSize?: number;
    sort?: EdamConceptSort;
    direction?: EdamConceptDirection | null;
    /**
     * A string of search terms used to filter the results.
     */
    searchTerms?: string;
    /**
     * An array of EDAM sections (sub-ontologies) used to filter the results.
     */
    sections?: Array<EdamSection>;
}

