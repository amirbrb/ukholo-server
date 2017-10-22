const jsonSuccess = require('../models/jsonSuccess');
const jsonFailure = require('../models/jsonFailure');
const Guid = require('guid');

var sosData = [{
        userImage: 'avatar.png',
        title: 'case title1',
        description: 'case desription dkflm,nvlk lkjnlkjlkjl case desriptionfvb fdkjdlkkj  dlkfjldkfj case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title3',
        description: 'case desription svdv df sddf case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    },
    {
        userImage: 'avatar.png',
        title: 'case title4',
        description: 'case desriptionfvb fdkjdlkkj  dlkfjldkfj',
        id: Guid.create()
    }
];

module.exports = {
    getHelpCases(location) {
        return sosData;
    }
}
