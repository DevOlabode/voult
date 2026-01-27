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

router.get('/:id/google-oauth', controller.getGoogleOAuth);

router.post('/:id/google-oauth', controller.saveGoogleOAuth);

module.exports = router;