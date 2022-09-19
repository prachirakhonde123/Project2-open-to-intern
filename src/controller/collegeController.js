const collegeModel = require('../model/collegeModel')
const internModel = require('../model/internModel')




//_______________________________________________ Create College ______________________________________________________//


const createCollege = async function(req, res){
    try{
        
        let collegeData = req.body
        const nameRegex = /^[a-z]+$/
        const fullnameRegex = /^[a-zA-Z\s]+$/
        const logolinkRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
        
        //________________________________validation for college name__________________________________________

        if(!collegeData.name) return res.status(400).send({status : false, message : "College name is mandatory"})

        if (!collegeData.name.match(nameRegex)) return res.status(400).send({status:false, message: "name should be in lowercase"})  
        
        //_______________________________ checking duplicate college _________________________________________

        let college = await collegeModel.findOne({name: collegeData.name})

        if(college) return res.status(400).send({status:false , message: "College already exist"})

        //_______________________________ validation for fullname _______________________________________________________

        if(!collegeData.fullName) return res.status(400).send({status : false, message : "Please provide full name of College"})
      
        if (!collegeData.fullName.match(fullnameRegex)) return res.status(400).send({status:false,msg: "College name must be contains letters only"})  
         
        //________________________________________ validation for logoLink _________________________________________________

        if(!collegeData.logoLink) return res.status(400).send({status : false, message : "Please provide Logolink"})

        if (!collegeData.logoLink.match(logolinkRegex)) return res.status(400).send({ status:false , message: "logolink is invalid"})  

        //_________________________________ College is created ________________________________________________

        let createCollege = await collegeModel.create(collegeData)
        // using destructure find the key value of College
        const { name,fullName,logoLink } = createCollege
        
        // response  at postman
        let obj = {
            name : name,
            fullName : fullName,
            logoLink : logoLink,
            isDeleted : false
        }
        
        return res.status(201).send({ status : true , data : obj})

    }
    catch (err) {
        return res.status(500).send({ status : false, message : err.message})
    }
}


//_____________________________________________ Get college Interns ______________________________________________________//


const getList = async function(req,res){
    res.setHeader('Access-Control-Allow-Origin','*')
    try{
        
        let data = req.query
        
        //______________________________________ query is not given ____________________________________________________

        if(Object.keys(data).length == 0) return res.status(400).send({status : false, message : "Query can't be empty.Please provide College Name"})

        //________________________________________ contains query __________________________________________________________

        if(data){
            // if given value is empty
            if(data.collegeName == "") return res.status(400).send({status : false, message : "Name of College can't be empty"})
            
            // if different query is given
            if(!data.collegeName) return res.status(400).send({status : false, message : "Query must contains key = collegeName"})          
        }
        
        // We made user happy here!
        if(data.collegeName !== ""){
            let name = data.collegeName.toLowerCase()
            data.collegeName = name
        }

        //____________________________________ finding valid college ___________________________________________________
        
        let findCollege = await collegeModel.findOne({name : data.collegeName, isDeleted : false})
        
        //______________________________ giving wrong college name ________________________________________

        if(!findCollege) return res.status(404).send({status:false , message:"No such college"})

        const {name, fullName, logoLink} = findCollege
    
        let CollegeId = findCollege._id

        //_________________________________ finding interns in the college ________________________________________

        let findIntern = await internModel.find({collegeId : CollegeId}).select({name : 1, email : 1, mobile : 1})
        
        //______________________________No intern found in given college ___________________________________

        if(findIntern.length == 0){
            let clgObj = {
                name : name,
                fullName : fullName,
                logoLink : logoLink,
            }
            return res.status(200).send({status : true, data : clgObj, message : "No intern has applied to this college"})
        } 
        
        //______________________________________  Intern found ___________________________________________________

        let obj = {
            name : name,
            fullName : fullName,
            logoLink : logoLink,
            interns : findIntern
        }
        return res.status(200).send({status: true ,data : obj})
    }

    catch(err){
        res.status(500).send({status : false, error : err.message})
    }
}


//_______________________________________ module export _____________________________________________//

module.exports.createCollege= createCollege;

module.exports.getList = getList