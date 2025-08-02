#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 获取指定目录下Git修改文件的修改时间，并按时间倒序排列
 * @param {string} targetDir - 目标目录路径
 * @param {Date|null} afterTime - 可选参数，只显示此时间之后修改的文件
 */
function getGitFileModifyTimes(targetDir, afterTime = null) {
    try {
        // 检查目录是否存在
        if (!fs.existsSync(targetDir)) {
            console.error(`错误: 目录不存在 - ${targetDir}`);
            process.exit(1);
        }

        // 切换到目标目录并执行git status --porcelain
        const gitStatusCommand = `cd "${targetDir}" && git status --porcelain`;
        const gitOutput = execSync(gitStatusCommand, { encoding: 'utf8' });

        if (!gitOutput.trim()) {
            console.log('没有找到任何修改的文件。');
            return;
        }

        // 解析git status输出，提取文件路径
        const lines = gitOutput.trim().split('\n');
        const files = lines.map(line => {
            // git status --porcelain格式: XY filename
            // 去掉前两个字符（状态标识）和可能的空格
            return line.substring(3);
        }).filter(file => file.length > 0);

        // 获取每个文件的修改时间和绝对路径
        const fileInfos = [];
        
        for (const file of files) {
            const fullPath = path.resolve(targetDir, file);
            
            try {
                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    fileInfos.push({
                        relativePath: file,
                        //去除targetDir后的路径
                        relativePathStr: path.relative(targetDir, fullPath),
                        absolutePath: fullPath,
                        modifyTime: stats.mtime,
                        modifyTimeString: formatDateTime(stats.mtime)
                    });
                }
            } catch (error) {
                console.warn(`警告: 无法获取文件信息 - ${fullPath}: ${error.message}`);
            }
        }

        // 按修改时间倒序排列（最新的在前面）
        fileInfos.sort((a, b) => b.modifyTime - a.modifyTime);

        // 如果指定了时间过滤条件，则过滤文件
        let filteredFileInfos = fileInfos;
        if (afterTime) {
            filteredFileInfos = fileInfos.filter(fileInfo => fileInfo.modifyTime > afterTime);
        }

        // 输出结果
        console.log('\n=== Git修改文件列表（按修改时间倒序排列）===');
        console.log(`目标目录: ${targetDir}`);
        if (afterTime) {
            console.log(`时间过滤: 只显示 ${formatDateTime(afterTime)} 之后修改的文件`);
        }
        console.log(`找到 ${filteredFileInfos.length} 个文件${afterTime ? ` (总共 ${fileInfos.length} 个修改文件)` : ''}\n`);

        filteredFileInfos.forEach((fileInfo, index) => {
            //console.log(`${index + 1}. ${fileInfo.absolutePath}`);
            console.log(`${filteredFileInfos.length - index}. ${fileInfo.relativePathStr}, ${fileInfo.modifyTimeString}`);
            console.log('');
        });

    } catch (error) {
        console.error(`执行错误: ${error.message}`);
        process.exit(1);
    }
}

/**
 * 解析时间字符串为Date对象
 * @param {string} timeStr - 时间字符串，支持格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss
 * @returns {Date|null} 解析后的Date对象，解析失败返回null
 */
function parseTimeString(timeStr) {
    if (!timeStr) return null;
    
    try {
        // 支持格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss
        let dateStr = timeStr.trim();
        
        // 如果只有日期部分，添加时间部分 00:00:00
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            dateStr += ' 00:00:00';
        }
        
        // 验证格式是否正确
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
            return null;
        }
        
        const date = new Date(dateStr);
        
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            return null;
        }
        
        return date;
    } catch (error) {
        return null;
    }
}

/**
 * 格式化日期时间
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期时间字符串
 */
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 主函数
function main() {
    // 从命令行参数获取目标目录和时间过滤条件
    const args = process.argv.slice(2);
    
    // 显示帮助信息
    if (args.includes('--help') || args.includes('-h')) {
        console.log('Git文件修改时间查询工具');
        console.log('========================');
        console.log('');
        console.log('用法:');
        console.log('  node git-file-times.js [目标目录] [时间过滤]');
        console.log('');
        console.log('参数:');
        console.log('  目标目录    Git仓库的路径 (可选，默认为预设路径)');
        console.log('  时间过滤    只显示指定时间之后修改的文件 (可选)');
        console.log('');
        console.log('时间格式:');
        console.log('  YYYY-MM-DD        例如: 2025-07-30');
        console.log('  YYYY-MM-DD HH:mm:ss   例如: 2025-07-30 14:30:00');
        console.log('');
        console.log('示例:');
        console.log('  node git-file-times.js');
        console.log('  node git-file-times.js /path/to/repo');
        console.log('  node git-file-times.js /path/to/repo 2025-07-30');
        console.log('  node git-file-times.js /path/to/repo "2025-07-30 14:30:00"');
        return;
    }
    
    const targetDir = args[0] || '/default/path/to/repo'; // 默认目标目录，可根据需要修改
    const afterTimeStr = args[1]; // 第二个参数为时间过滤条件
    
    let afterTime = null;
    if (afterTimeStr) {
        afterTime = parseTimeString(afterTimeStr);
        if (!afterTime) {
            console.error(`错误: 无效的时间格式 "${afterTimeStr}"`);
            console.error('支持的格式: YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss');
            console.error('例如: 2025-07-30 或 2025-07-30 14:30:00');
            process.exit(1);
        }
    }

    console.log('Git文件修改时间查询工具');
    console.log('========================');
    
    getGitFileModifyTimes(targetDir, afterTime);
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
    main();
}

module.exports = { getGitFileModifyTimes, formatDateTime, parseTimeString };
