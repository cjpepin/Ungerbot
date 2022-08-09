using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ErrorController : ControllerBase
    {
        private readonly IErrorService _errorService;
        private readonly IUserService _userService;

        public ErrorController(IUserService userService, IErrorService errorService)
        {
            _userService = userService;
            _errorService = errorService;
        }

        [HttpGet("get-single-error"), Authorize]
        public async Task<IActionResult> GetSingleError([FromQuery] Error err)
        {
            Error? error = await _errorService.GetByIdAsync(err.Id);

            if (error is null)
                return NotFound();
            else
                return Ok(error);
        }

        [HttpGet("get-all-errors"), Authorize]
        public async Task<IActionResult> GetAllErrors()
        {
            List<Error>? error = await _errorService.GetAllAsync();

            if (error is null)
                return NotFound();
            else
                return Ok(error);
        }

        [HttpPost("add-error"), Authorize]
        public async Task<IActionResult> AddError([FromBody] Error error)
        {
            Console.WriteLine(error.UserName);

            User? userRecord = await _userService.GetByNameAsync(error.UserName);
            Console.WriteLine(userRecord);
            if (userRecord is null)
                return NotFound();

            await _errorService.CreateAsync(error);

            return Ok();
        }

        [HttpGet("delete-error"), Authorize]
        public async Task<IActionResult> DeleteError(string id)
        {
            await _errorService.DeleteError(id);
            return Ok();
        }
    }
}
