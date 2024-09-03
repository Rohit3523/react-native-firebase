/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  isAlphaNumericUnderscore,
  isE164PhoneNumber,
  isIOS,
  isNull,
  isNumber,
  isObject,
  isOneOf,
  isString,
  isUndefined,
} from '@react-native-firebase/app/lib/common';
import { validateStruct, validateCompound } from '@react-native-firebase/app/lib/common/struct';

import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import { setReactNativeModule } from '@react-native-firebase/app/lib/internal/nativeModule';
import { isBoolean } from '@react-native-firebase/app/lib/common';

import fallBackModule from './web/RNFBAnalyticsModule';
import version from './version';
import * as structs from './structs';

const ReservedEventNames = [
  'ad_activeview',
  'ad_click',
  'ad_exposure',
  // 'ad_impression', // manual ad_impression logging is allowed, See #6307
  'ad_query',
  'ad_reward',
  'adunit_exposure',
  'app_background',
  'app_clear_data',
  // 'app_exception',
  'app_remove',
  'app_store_refund',
  'app_store_subscription_cancel',
  'app_store_subscription_convert',
  'app_store_subscription_renew',
  'app_update',
  'app_upgrade',
  'dynamic_link_app_open',
  'dynamic_link_app_update',
  'dynamic_link_first_open',
  'error',
  'first_open',
  'first_visit',
  'in_app_purchase',
  'notification_dismiss',
  'notification_foreground',
  'notification_open',
  'notification_receive',
  'os_update',
  'session_start',
  'session_start_with_rollout',
  'user_engagement',
];

const statics = {};

const namespace = 'analytics';

const nativeModuleName = 'RNFBAnalyticsModule';

class FirebaseAnalyticsModule extends FirebaseModule {
  logEvent(name, params = {}, options = {}) {
    console.warn('This method is deprecated. Please use `logEvent()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isString(name)) {
      throw new Error("firebase.analytics().logEvent(*) 'name' expected a string value.");
    }

    if (!isUndefined(params) && !isObject(params)) {
      throw new Error("firebase.analytics().logEvent(_, *) 'params' expected an object value.");
    }

    // check name is not a reserved event name
    if (isOneOf(name, ReservedEventNames)) {
      throw new Error(
        `firebase.analytics().logEvent(*) 'name' the event name '${name}' is reserved and can not be used.`,
      );
    }

    // name format validation
    if (!isAlphaNumericUnderscore(name) || name.length > 40) {
      throw new Error(
        `firebase.analytics().logEvent(*) 'name' invalid event name '${name}'. Names should contain 1 to 40 alphanumeric characters or underscores.`,
      );
    }

    if (!isUndefined(options)) {
      if (!isObject(options)) {
        throw new Error(
          "firebase.analytics().logEvent(_, _, *) 'options' expected an object value.",
        );
      }

      if (!isUndefined(options.global) && !isBoolean(options.global)) {
        throw new Error("'options.global' property expected a boolean.");
      }
    }

    return this.native.logEvent(name, params);
  }

  setAnalyticsCollectionEnabled(enabled) {
    console.warn('This method is deprecated. Please use `setAnalyticsCollectionEnabled()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.analytics().setAnalyticsCollectionEnabled(*) 'enabled' expected a boolean value.",
      );
    }

    return this.native.setAnalyticsCollectionEnabled(enabled);
  }

  setSessionTimeoutDuration(milliseconds = 1800000) {
    console.warn('This method is deprecated. Please use `setSessionTimeoutDuration()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isNumber(milliseconds)) {
      throw new Error(
        "firebase.analytics().setSessionTimeoutDuration(*) 'milliseconds' expected a number value.",
      );
    }

    if (milliseconds < 0) {
      throw new Error(
        "firebase.analytics().setSessionTimeoutDuration(*) 'milliseconds' expected a positive number value.",
      );
    }

    return this.native.setSessionTimeoutDuration(milliseconds);
  }

  getAppInstanceId() {
    console.warn('This method is deprecated. Please use `getAppInstanceId()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    return this.native.getAppInstanceId();
  }

  getSessionId() {
    console.warn('This method is deprecated. Please use `getSessionId()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    return this.native.getSessionId();
  }

  setUserId(id) {
    console.warn('This method is deprecated. Please use `setUserId()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isNull(id) && !isString(id)) {
      throw new Error("firebase.analytics().setUserId(*) 'id' expected a string value.");
    }

    return this.native.setUserId(id);
  }

  setUserProperty(name, value) {
    console.warn('This method is deprecated. Please use `setUserProperty()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isString(name)) {
      throw new Error("firebase.analytics().setUserProperty(*) 'name' expected a string value.");
    }

    if (value !== null && !isString(value)) {
      throw new Error(
        "firebase.analytics().setUserProperty(_, *) 'value' expected a string value.",
      );
    }

    return this.native.setUserProperty(name, value);
  }

  setUserProperties(properties, options = {}) {
    console.warn('This method is deprecated. Please use `setUserProperties()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(properties)) {
      throw new Error(
        "firebase.analytics().setUserProperties(*) 'properties' expected an object of key/value pairs.",
      );
    }

    if (!isUndefined(options)) {
      if (!isObject(options)) {
        throw new Error(
          "firebase.analytics().logEvent(_, _, *) 'options' expected an object value.",
        );
      }

      if (!isUndefined(options.global) && !isBoolean(options.global)) {
        throw new Error("'options.global' property expected a boolean.");
      }
    }

    const entries = Object.entries(properties);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (!isNull(value) && !isString(value)) {
        throw new Error(
          `firebase.analytics().setUserProperties(*) 'properties' value for parameter '${key}' is invalid, expected a string.`,
        );
      }
    }

    return this.native.setUserProperties(properties);
  }

  resetAnalyticsData() {
    console.warn('This method is deprecated. Please use `resetAnalyticsData()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    return this.native.resetAnalyticsData();
  }

  setConsent(consentSettings) {
    console.warn('This method is deprecated. Please use `setConsent()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(consentSettings)) {
      throw new Error(
        'firebase.analytics().setConsent(*): The supplied arg must be an object of key/values.',
      );
    }

    const entries = Object.entries(consentSettings);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (!isBoolean(value)) {
        throw new Error(
          `firebase.analytics().setConsent(*) 'consentSettings' value for parameter '${key}' is invalid, expected a boolean.`,
        );
      }
    }

    return this.native.setConsent(consentSettings);
  }

  /** -------------------
   *        EVENTS
   * -------------------- */
  logAddPaymentInfo(object = {}) {
    console.warn('This method is deprecated. Please use `logAddPaymentInfo()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddPaymentInfo(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddPaymentInfo(*):');

    return this.logEvent(
      'add_payment_info',
      validateStruct(object, structs.AddPaymentInfo, 'firebase.analytics().logAddPaymentInfo(*):'),
    );
  }

  logScreenView(object) {
    console.warn('This method is deprecated. Please use `logScreenView()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logScreenView(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'screen_view',
      validateStruct(object, structs.ScreenView, 'firebase.analytics().logScreenView(*):'),
    );
  }

  logAddShippingInfo(object = {}) {
    console.warn('This method is deprecated. Please use `logAddShippingInfo()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddShippingInfo(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddShippingInfo(*):');

    return this.logEvent(
      'add_shipping_info',
      validateStruct(
        object,
        structs.AddShippingInfo,
        'firebase.analytics().logAddShippingInfo(*):',
      ),
    );
  }

  logAddToCart(object = {}) {
    console.warn('This method is deprecated. Please use `logAddToCart()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddToCart(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddToCart(*):');

    return this.logEvent(
      'add_to_cart',
      validateStruct(object, structs.AddToCart, 'firebase.analytics().logAddToCart(*):'),
    );
  }

  logAddToWishlist(object = {}) {
    console.warn('This method is deprecated. Please use `logAddToWishlist()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddToWishlist(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddToWishlist(*):');

    return this.logEvent(
      'add_to_wishlist',
      validateStruct(object, structs.AddToWishlist, 'firebase.analytics().logAddToWishlist(*):'),
    );
  }

  logAppOpen() {
    console.warn('This method is deprecated. Please use `logAppOpen()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    return this.logEvent('app_open');
  }

  logBeginCheckout(object = {}) {
    console.warn('This method is deprecated. Please use `logBeginCheckout()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logBeginCheckout(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logBeginCheckout(*):');

    return this.logEvent(
      'begin_checkout',
      validateStruct(object, structs.BeginCheckout, 'firebase.analytics().logBeginCheckout(*):'),
    );
  }

  logCampaignDetails(object) {
    console.warn('This method is deprecated. Please use `logCampaignDetails()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logCampaignDetails(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'campaign_details',
      validateStruct(
        object,
        structs.CampaignDetails,
        'firebase.analytics().logCampaignDetails(*):',
      ),
    );
  }

  logEarnVirtualCurrency(object) {
    console.warn('This method is deprecated. Please use `logEarnVirtualCurrency()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logEarnVirtualCurrency(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'earn_virtual_currency',
      validateStruct(
        object,
        structs.EarnVirtualCurrency,
        'firebase.analytics().logEarnVirtualCurrency(*):',
      ),
    );
  }

  logGenerateLead(object = {}) {
    console.warn('This method is deprecated. Please use `logGenerateLead()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logGenerateLead(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logGenerateLead(*):');

    return this.logEvent(
      'generate_lead',
      validateStruct(object, structs.GenerateLead, 'firebase.analytics().logGenerateLead(*):'),
    );
  }

  logJoinGroup(object) {
    console.warn('This method is deprecated. Please use `logJoinGroup()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logJoinGroup(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'join_group',
      validateStruct(object, structs.JoinGroup, 'firebase.analytics().logJoinGroup(*):'),
    );
  }

  logLevelEnd(object) {
    console.warn('This method is deprecated. Please use `logLevelEnd()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logLevelEnd(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'level_end',
      validateStruct(object, structs.LevelEnd, 'firebase.analytics().logLevelEnd(*):'),
    );
  }

  logLevelStart(object) {
    console.warn('This method is deprecated. Please use `logLevelStart()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logLevelStart(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'level_start',
      validateStruct(object, structs.LevelStart, 'firebase.analytics().logLevelStart(*):'),
    );
  }

  logLevelUp(object) {
    console.warn('This method is deprecated. Please use `logLevelUp()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logLevelUp(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'level_up',
      validateStruct(object, structs.LevelUp, 'firebase.analytics().logLevelUp(*):'),
    );
  }

  logLogin(object) {
    console.warn('This method is deprecated. Please use `logLogin()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logLogin(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'login',
      validateStruct(object, structs.Login, 'firebase.analytics().logLogin(*):'),
    );
  }

  logPostScore(object) {
    console.warn('This method is deprecated. Please use `logPostScore()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logPostScore(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'post_score',
      validateStruct(object, structs.PostScore, 'firebase.analytics().logPostScore(*):'),
    );
  }

  logSelectContent(object) {
    console.warn('This method is deprecated. Please use `logSelectContent()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logSelectContent(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'select_content',
      validateStruct(object, structs.SelectContent, 'firebase.analytics().logSelectContent(*):'),
    );
  }

  logPurchase(object = {}) {
    console.warn('This method is deprecated. Please use `logPurchase()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logPurchase(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logPurchase(*):');

    return this.logEvent(
      'purchase',
      validateStruct(object, structs.Purchase, 'firebase.analytics().logPurchaseEvent(*):'),
    );
  }

);

logRefund(object = {}) {
  console.warn('This method is deprecated. Please use `logRefund()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logRefund(*): The supplied arg must be an object of key/values.',
    );
  }

  validateCompound(object, 'value', 'currency', 'firebase.analytics().logRefund(*):');

  return this.logEvent(
    'refund',
    validateStruct(object, structs.Refund, 'firebase.analytics().logRefund(*):'),
  );
}

logRemoveFromCart(object = {}) {
  console.warn('This method is deprecated. Please use `logRemoveFromCart()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logRemoveFromCart(*): The supplied arg must be an object of key/values.',
    );
  }

  validateCompound(object, 'value', 'currency', 'firebase.analytics().logRemoveFromCart(*):');

  return this.logEvent(
    'remove_from_cart',
    validateStruct(object, structs.RemoveFromCart, 'firebase.analytics().logRemoveFromCart(*):'),
  );
}

logSearch(object) {
  console.warn('This method is deprecated. Please use `logSearch()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logSearch(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'search',
    validateStruct(object, structs.Search, 'firebase.analytics().logSearch(*):'),
  );
}

logSelectItem(object = {}) {
  console.warn('This method is deprecated. Please use `logSelectItem()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logSelectItem(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'select_item',
    validateStruct(object, structs.SelectItem, 'firebase.analytics().logSelectItem(*):'),
  );
}

logSetCheckoutOption(object) {
  console.warn('This method is deprecated. Please use `logSetCheckoutOption()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logSetCheckoutOption(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'set_checkout_option',
    validateStruct(
      object,
      structs.SetCheckoutOption,
      'firebase.analytics().logSetCheckoutOption(*):',
    ),
  );
}

logSelectPromotion(object) {
  console.warn('This method is deprecated. Please use `logSelectPromotion()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logSelectPromotion(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'select_promotion',
    validateStruct(
      object,
      structs.SelectPromotion,
      'firebase.analytics().logSelectPromotion(*):',
    ),
  );
}

logShare(object) {
  console.warn('This method is deprecated. Please use `logShare()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logShare(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'share',
    validateStruct(object, structs.Share, 'firebase.analytics().logShare(*):'),
  );
}

logSignUp(object) {
  console.warn('This method is deprecated. Please use `logSignUp()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logSignUp(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'sign_up',
    validateStruct(object, structs.SignUp, 'firebase.analytics().logSignUp(*):'),
  );
}

logSpendVirtualCurrency(object) {
  console.warn('This method is deprecated. Please use `logSpendVirtualCurrency()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logSpendVirtualCurrency(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'spend_virtual_currency',
    validateStruct(
      object,
      structs.SpendVirtualCurrency,
      'firebase.analytics().logSpendVirtualCurrency(*):',
    ),
  );
}

logTutorialBegin() {
  console.warn('This method is deprecated. Please use `logTutorialBegin()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  return this.logEvent('tutorial_begin');
}

logTutorialComplete() {
  console.warn('This method is deprecated. Please use `logTutorialComplete()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  return this.logEvent('tutorial_complete');
}

logUnlockAchievement(object) {
  console.warn('This method is deprecated. Please use `logUnlockAchievement()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logUnlockAchievement(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'unlock_achievement',
    validateStruct(
      object,
      structs.UnlockAchievement,
      'firebase.analytics().logUnlockAchievement(*):',
    ),
  );
}

logViewCart(object = {}) {
  console.warn('This method is deprecated. Please use `logViewCart()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logViewCart(*): The supplied arg must be an object of key/values.',
    );
  }

  validateCompound(object, 'value', 'currency', 'firebase.analytics().logViewCart(*):');

  return this.logEvent(
    'view_cart',
    validateStruct(object, structs.ViewCart, 'firebase.analytics().logViewCart(*):'),
  );
}

logViewItem(object = {}) {
  console.warn('This method is deprecated. Please use `logViewItem()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logViewItem(*): The supplied arg must be an object of key/values.',
    );
  }
  validateCompound(object, 'value', 'currency', 'firebase.analytics().logViewItem(*):');

  return this.logEvent(
    'view_item',
    validateStruct(object, structs.ViewItem, 'firebase.analytics().logViewItem(*):'),
  );
}

logViewItemList(object = {}) {
  console.warn('This method is deprecated. Please use `logViewItemList()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logViewItemList(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'view_item_list',
    validateStruct(object, structs.ViewItemList, 'firebase.analytics().logViewItemList(*):'),
  );
}

logViewPromotion(object = {}) {
  console.warn('This method is deprecated. Please use `logViewPromotion()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logViewPromotion(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'view_promotion',
    validateStruct(object, structs.ViewPromotion, 'firebase.analytics().logViewPromotion(*):'),
  );
}

logViewSearchResults(object) {
  console.warn('This method is deprecated. Please use `logViewSearchResults()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(object)) {
    throw new Error(
      'firebase.analytics().logViewSearchResults(*): The supplied arg must be an object of key/values.',
    );
  }

  return this.logEvent(
    'view_search_results',
    validateStruct(
      object,
      structs.ViewSearchResults,
      'firebase.analytics().logViewSearchResults(*):',
    ),
  );
}

setDefaultEventParameters(params) {
  console.warn('This method is deprecated. Please use `setDefaultEventParameters()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isObject(params) && !isNull(params) && !isUndefined(params)) {
    throw new Error(
      "firebase.analytics().setDefaultEventParameters(*) 'params' expected an object value when it is defined.",
    );
  }

  return this.native.setDefaultEventParameters(params);
}

initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress) {
  console.warn('This method is deprecated. Please use `initiateOnDeviceConversionMeasurementWithEmailAddress()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isString(emailAddress)) {
    throw new Error(
      "firebase.analytics().initiateOnDeviceConversionMeasurementWithEmailAddress(*) 'emailAddress' expected a string value.",
    );
  }

  if (!isIOS) {
    return;
  }

  return this.native.initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress);
}

initiateOnDeviceConversionMeasurementWithHashedEmailAddress(hashedEmailAddress) {
  console.warn('This method is deprecated. Please use `initiateOnDeviceConversionMeasurementWithHashedEmailAddress()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isString(hashedEmailAddress)) {
    throw new Error(
      "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedEmailAddress(*) 'hashedEmailAddress' expected a string value.",
    );
  }

  if (!isIOS) {
    return;
  }

  return this.native.initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
    hashedEmailAddress,
  );
}

initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber) {
  console.warn('This method is deprecated. Please use `initiateOnDeviceConversionMeasurementWithPhoneNumber()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (!isE164PhoneNumber(phoneNumber)) {
    throw new Error(
      "firebase.analytics().initiateOnDeviceConversionMeasurementWithPhoneNumber(*) 'phoneNumber' expected a string value in E.164 format.",
    );
  }

  if (!isIOS) {
    return;
  }

  return this.native.initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber);
}

initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(hashedPhoneNumber) {
  console.warn('This method is deprecated. Please use `initiateOnDeviceConversionMeasurementWithHashedPhoneNumber()` instead. This is part of breaking change to match Firebase v9 web JS SDK.');
  if (isE164PhoneNumber(hashedPhoneNumber)) {
    throw new Error(
      "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(*) 'hashedPhoneNumber' expected a sha256-hashed value of a phone number in E.164 format.",
    );
  }

  if (!isString(hashedPhoneNumber)) {
    throw new Error(
      "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(*) 'hashedPhoneNumber' expected a string value.",
    );
  }

  if (!isIOS) {
    return;
  }

  return this.native.initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
    hashedPhoneNumber,
  );
}
}

// import { SDK_VERSION } from '@react-native-firebase/analytics';
export const SDK_VERSION = version;

// import analytics from '@react-native-firebase/analytics';
// analytics().logEvent(...);
export default createModuleNamespace({
statics,
version,
namespace,
nativeModuleName,
nativeEvents: false,
hasMultiAppSupport: false,
hasCustomUrlOrRegionSupport: false,
ModuleClass: FirebaseAnalyticsModule,
});

export * from './modular/index';

// import analytics, { firebase } from '@react-native-firebase/analytics';
// analytics().logEvent(...);
// firebase.analytics().logEvent(...);
export const firebase = getFirebaseRoot();

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule);
