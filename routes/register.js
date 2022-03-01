
const express=require('express')
const router=express.Router();
const {isActive,isAdmin}=require('../auth')
const { addregister,login,changePassword,logout,viewUsers,manageUser,manageUserById ,updateUserById,deleteUserById}=require('../controler/registerMaster');

router.post('/add-user',isActive,isAdmin,addregister);
router.get('/view-users',isActive,isAdmin,viewUsers)
router.post('/login',login)
router.post('/logout',logout)
router.get('/manage-user',isActive,isAdmin,manageUser)
router.get('/manage-user/:id',isActive,isAdmin,manageUserById)
router.post('/manage-user/:id',isActive,isAdmin,updateUserById)
router.get('/delete-user/:id',isActive,isAdmin,deleteUserById)
router.post('/change-password',changePassword);
// router.get('/admin/user/:register_id', getUser);
// router.post('/admin/user/:register_id', updateUser);
// router.get('/admin/user/delete/:register_id', deleteUser);

module.exports=router;