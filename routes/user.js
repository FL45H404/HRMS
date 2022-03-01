const express=require('express')
const router=express.Router();
const {isActive}=require('../auth')
const { addProfile,viewProfile,viewAttendance,birthdays,updateProfile,viewProfileById,birthdayWish}=require('../controler/userProfile');

router.post('/add-profile',addProfile);
router.get('/view-profile/:id',isActive,viewProfileById)
router.post('/update-profile/:id',updateProfile);
router.get('/view-profile',isActive,viewProfile)
router.get('/activity',isActive,viewAttendance)
router.get('/birthdays',isActive,birthdays)
router.get('/birthdaywish/:id',isActive,birthdayWish)
// router.post('/login',login)
// router.post('/logout',logout)
// router.get('/admin/user/:register_id', getUser);
// router.post('/admin/user/:register_id', updateUser);
// router.get('/admin/user/delete/:register_id', deleteUser);

module.exports=router;