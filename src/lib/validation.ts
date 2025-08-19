/**
 * 验证工具函数
 * 用于验证用户注册和登录时的输入数据
 */

/**
 * 验证邮箱格式是否合理
 * @param email 邮箱地址
 * @returns 验证结果对象
 */
export function validateEmail(email: string): { isValid: boolean; message: string } {
  // 基本的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: '邮箱地址不能为空' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: '请输入有效的邮箱地址' };
  }
  
  // 检查邮箱长度
  if (email.length > 254) {
    return { isValid: false, message: '邮箱地址过长' };
  }
  
  // 检查本地部分和域名部分
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: '邮箱地址格式不正确' };
  }
  
  const [localPart, domain] = parts;
  if (!localPart || !domain) {
    return { isValid: false, message: '邮箱地址格式不正确' };
  }
  
  if (localPart.length > 64) {
    return { isValid: false, message: '邮箱地址格式不正确' };
  }
  
  if (domain.length > 253) {
    return { isValid: false, message: '邮箱地址格式不正确' };
  }
  
  return { isValid: true, message: '' };
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果对象
 */
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (!password) {
    return { isValid: false, message: '密码不能为空' };
  }
  
  // 检查密码长度 (6-12位)
  if (password.length < 6) {
    return { isValid: false, message: '密码长度至少为6位' };
  }
  
  if (password.length > 12) {
    return { isValid: false, message: '密码长度不能超过12位' };
  }
  
  // 检查是否包含字母
  const hasLetter = /[a-zA-Z]/.test(password);
  
  // 检查是否包含特殊字符
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasLetter && !hasSpecialChar) {
    return { isValid: false, message: '密码必须包含字母或特殊字符' };
  }
  
  return { isValid: true, message: '' };
}

/**
 * 验证用户名
 * @param name 用户名
 * @returns 验证结果对象
 */
export function validateName(name: string): { isValid: boolean; message: string } {
  if (!name) {
    return { isValid: false, message: '用户名不能为空' };
  }
  
  if (name.length < 2) {
    return { isValid: false, message: '用户名至少需要2个字符' };
  }
  
  if (name.length > 50) {
    return { isValid: false, message: '用户名不能超过50个字符' };
  }
  
  // 检查是否包含特殊字符（只允许字母、数字、空格、连字符和下划线）
  const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: '用户名只能包含字母、数字、空格、连字符和下划线' };
  }
  
  return { isValid: true, message: '' };
}

/**
 * 实时验证表单字段
 * @param field 字段名
 * @param value 字段值
 * @returns 验证结果对象
 */
export function validateField(field: 'name' | 'email' | 'password', value: string) {
  switch (field) {
    case 'name':
      return validateName(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    default:
      return { isValid: true, message: '' };
  }
}
