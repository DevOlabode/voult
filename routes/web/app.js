const express = require('express');
const router = express.Router();

const controller = require('../../controllers/web/app');

const catchAsync = require('../../utils/catchAsync');

const { validate } = require('../../validators/validate');
const appSchemas = require('../../validators/web/app');

const {isLoggedIn} = require('../../middleware');

router.use(isLoggedIn);

router.get('/new', controller.newForm);

router.post('/', validate(appSchemas.createAppSchema),  catchAsync(controller.newApp));

router.post('/:id/toggle', catchAsync(controller.toggleApp));

router.get('/:id', catchAsync(controller.manage));

router.delete('/:id', catchAsync(controller.deleteApp));

router.get('/:id/edit', catchAsync(controller.editForm));

router.put('/:id', validate(appSchemas.createAppSchema), catchAsync(controller.updateApp));

router.post('/:id/rotate-secret',catchAsync(controller.rotateClientSecret));

router.get('/:id/google-oauth', catchAsync(controller.getGoogleOAuth));

router.post('/:id/google-oauth', catchAsync(controller.saveGoogleOAuth));

router.get('/:id/github-oauth', catchAsync(controller.getGithubOAuth));

router.post('/:id/github-oauth', catchAsync(controller.saveGithubOAuth));

router.post('/app/:id/update-google-oauth', catchAsync(controller.updateGoogleOAuth));

router.post('/app/:id/update-github-oauth', catchAsync(controller.updateGithubOAuth));

router.get('/:id/facebook-oauth', catchAsync(controller.getFacebookOAuth));

router.post('/:id/facebook-oauth', catchAsync(controller.saveFacebookOAuth));

router.post('/:id/update-facebook-oauth', catchAsync(controller.updateFacebookOAuth));

module.exports = router;