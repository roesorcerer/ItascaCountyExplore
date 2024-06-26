export default {
  name: 'save',
  title: 'Save',
  type: 'document',
  fields: [
    {
      name: 'postedBy',
      title: 'PostedBy',
      type: 'reference',
      to: [{type: 'user'}],
    },
    {
      name: 'userID',
      title: 'UserID',
      type: 'string',
    },
  ],
}
