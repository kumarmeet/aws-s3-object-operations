const uploadSignatures = async (req, res) => {
  try {
    const base64Data = new Buffer.from(req.body.profile_pic.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    // Getting the file type, ie: jpeg, png or gif
    const type = req.body.profile_pic.split(';')[0].split('/')[1];

    let key = `${randomUUID()}`;

    const params = {
      Bucket: "uploads",
      Key: `customer_signatures/images/${key}`, // type is not required
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64', // required
      ContentType: `image/${type}` // required. Notice the back ticks
    }

    try {
      await s3.s3.putObject(params, (err, data) => {

        return res.status(200).json({ success: true, location: `https://ops-hrms-bucket-uploads.s3.ap-southeast-1.amazonaws.com/customer_signatures/images/${key}`, message: "File uploaded successfully" });
      })
    } catch (error) {
      return res.status(500).json({ success: false, data: error.message });
    }

    // Save the Location (url) to your database and Key if needs be.
    // As good developers, we should return the url and let other function do the saving to database etc
    console.log(location, key);

    return location;
  }
