const internModel = require("../model/internModel")
const collegeModel = require("../model/collegeModel")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

//____________________________________________ Create Intern __________________________________________________________//


const createIntern = async function(req,res){
    res.setHeader('Access-Control-Allow-Origin','*')
    try{
        let data = req.body
        let collegeName = data.collegeName
        
        const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
        const nameRegex = /^[a-zA-Z\s]+$/
        const mobileRegex = /^[6789]\d{9}$/  // As indian mobile number starts from digit 6 to 9
        
        // If body is empty
        if(Object.keys(data).length === 0) return res.status(400).send({status : false, message : "Provide data. Body can't be empty!"})
        
        //_____________________________________ validation for intern name_____________________________________

        if(!data.name) return res.status(400).send({status : false, message : "Name is Mandatory"})

        if(!isValid(data.name)) return res.status(400).send({status : false, message : "Name is in Invalid Format"})

        if(!data.name.match(nameRegex)) return res.status(400).send({status : false, message : "Invalid format of Name"})
        
        let finduser = await internModel.findOne({name : data.name})
        if(finduser)  return res.status(400).send({status : false, message : "Intern Already Exist!"})
        
        //_______________________________________validation for college name______________________________________

        if(!collegeName) return res.status(400).send({status : false, message : "College Name is mandatory"})

        if(!isValid(data.collegeName)) return res.status(400).send({status : false, message : "CollegeName is in Invalid Format"})
        
        //_________________________________________validation for mobile__________________________________________

        if (!data.mobile) return res.status(400).send({ status: false, message : "mobile number is required" })

        if(!data.mobile.match(mobileRegex)) return res.status(400).send({status : false, message : "Invalid format of mobile number"})
        
        let validmobile = await internModel.findOne({mobile : data.mobile})

        if (validmobile)  return res.status(400).send({status: false , message:"Mobile number is already exist"})
        
        //_________________________________________ validation for email_____________________________________________

        if (!data.email) return res.status(400).send({ Status: false, message: "email is required" })

        if(!data.email.match(emailRegex)) return res.status(400).send({status : false, message : "Invalid Format of Email"})

        //______________________________________checking duplicate email_______________________________________________

        let validEmail = await internModel.findOne({email : data.email})

        if(validEmail) return res.status(400).send({status : false, message : "Email is already exist"})

        let findCollege = await collegeModel.findOne({name : collegeName})
         // if college doesnot exist 
        if(!findCollege){
            return res.status(404).send({status : false, message : "No such a College"})
        }
        
        let CollegeId = findCollege._id

        data.collegeId = CollegeId // added college Id in DB // collegeId is the key which we insert for our requirement
        //CollegeId is the id of findCollege

        // creating intern 
        let intern = await internModel.create(data)
        
        // it is only for response at postman
        let internresponse = {
            name : data.name,
            email : data.email,
            mobile : data.mobile,
            collegeId : CollegeId,
            isDeleted : false
        }

        return res.status(201).send({status : true , data : internresponse})
    }

    catch(err){
        res.status(500).send({status : false, error : err.message})
    }
}

//_____________________________________ module export ____________________________________________________________// 

module.exports.createIntern = createIntern