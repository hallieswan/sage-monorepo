# coding: utf-8

"""
    OpenChallenges REST API

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest
import datetime

import openchallenges_client
from openchallenges_client.models.challenge_platform_search_query import ChallengePlatformSearchQuery  # noqa: E501
from openchallenges_client.rest import ApiException

class TestChallengePlatformSearchQuery(unittest.TestCase):
    """ChallengePlatformSearchQuery unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional):
        """Test ChallengePlatformSearchQuery
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `ChallengePlatformSearchQuery`
        """
        model = openchallenges_client.models.challenge_platform_search_query.ChallengePlatformSearchQuery()  # noqa: E501
        if include_optional :
            return ChallengePlatformSearchQuery(
                page_number = 0, 
                page_size = 1, 
                sort = 'relevance', 
                direction = 'asc', 
                search_terms = 'synapse'
            )
        else :
            return ChallengePlatformSearchQuery(
        )
        """

    def testChallengePlatformSearchQuery(self):
        """Test ChallengePlatformSearchQuery"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()