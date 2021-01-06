export const validateEmail = email => {
  const reg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const valid = reg.test(email);
  // const regLilish = /@lilith.sh$/.test(email);
  const regLilish1 = /@lilithgames.com|@lilith.com$/.test(email);

  if (valid) {
    // return {
    //     valid,
    //     code: 810
    // }

    if (regLilish1) {
      return {
        valid: true,
        code: "EMAIL_VALID",
        msg: 'Email validate success.'
      }
    } else {
      return {
        valid: false,
        code: "LILITH_EMAIL_REQUIRED",
        msg: 'lilithgames.com/lilith.com email required.'
      }
    }
  } else {
    return {
      valid: false,
      code: "EMAIL_INVALID",
      msg: 'Email is not valid.'
    }
  }
}

export const validatePhone = phone => {
  const valid = (/^\d{7,}$/).test(phone.replace(/[\s()+\-\.]|ext/gi, ''));
  if (valid) {
    return {
      valid,
      code: 910
    }
  } else {
    return {
      valid,
      code: 912
    }
  }
}

export const validateNickname = nickname => {
  return nickname.length >= 6 && /[a-z]/.test(nickname) && /[A-Z]/.test(nickname) && /[0-9]/.test(nickname);
}

export const validatePassword = password => {
  if (!/(?=.*\d)/.test(password)) {
    return {
      valid: false,
      msg: 'Must contains a number.',
      code: 'NUMBER_REQUIRED',
      msgCn: '需要数字'
    }
  } else if (!/(?=.*[a-z])/.test(password)) {
    return {
      valid: false,
      msg: 'Must contains a lowercase letter.',
      code: 'LOWERCASE_REQUIRED',
      msgCn: '需要小写字母'
    }
  } else if (!/(?=.*[A-Z])/.test(password)) {
    return {
      valid: false,
      msg: 'Must contains a uppercase letter.',
      code: 'UPPERCASE_REQUIRED',
      msgCn: '需要大写字母'
    }
  } else if (!/.{8,}/.test(password)) {
    return {
      valid: false,
      msg: 'Must contains more than 8 words.',
      code: 'LIMIT_LENGTH',
      msgCn: '超过8个字符'
    }
  } else {
    return {
      valid: true,
      msg: 'Congratulations!',
      code: 'PWD_VALID',
      msgCn: '密码验证成功'
    }
  }
}
