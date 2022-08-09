using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
using System.Net.Mail;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FloorPlanController : ControllerBase
    {
        private readonly IFloorPlanService _floorPlanService;
        private readonly IUserService _userService;

        public FloorPlanController(IFloorPlanService floorPlanService, IUserService userService)
        {
            _floorPlanService = floorPlanService;
            _userService = userService;
        }                      



        [HttpGet("get-scenes"), Authorize]
        public async Task<IActionResult> GetScenes([FromQuery] string username)
        {

            User? user = await _userService.GetByNameAsync(username);
            if (user is null)
            {
                return NotFound("User not found.");
            }

            FloorPlan? floorPlan = await _floorPlanService.GetByIdAsync(user.Id);

            if(floorPlan is null)
            {
                string emptyScene = await CreateEmptyFloorPlan(user.Id);
                return Ok(emptyScene);
            }
            return Ok(floorPlan.Scenes);
        }

        [HttpPost("create-empty-floor-plan"), Authorize]
        public async Task<string> CreateEmptyFloorPlan(string userId)
        {
            string time = DateTime.UtcNow.ToString();
            FloorPlan newFloorPlan = new FloorPlan(userId, time, this.emptyScene);
            await _floorPlanService.CreateAsync(newFloorPlan);
            return this.emptyScene;
        }
        [DisableRequestSizeLimit]
        [HttpPost("save-scene"), Authorize]
        public async Task<IActionResult> SaveScene([FromBody] JObject jsonBody)
        {
  
            // Check for bad json body
            if (jsonBody is null || !jsonBody.ContainsKey("body") || jsonBody["body"] is null)
            {
                return BadRequest("Bad json body");
            }
            JToken? body = jsonBody["body"];
            string username = (body!["username"] ?? "").ToString();
            string scene = (body!["scene"] ?? "").ToString();
            int ind = (int)(body!["ind"] ?? "");
            bool unsaved = (bool)(body!["unsaved"] ?? ""); ;

            User? user = await _userService.GetByNameAsync(username);
            if (user is null)
            {
                return NotFound("User not found.");
            }

            if (unsaved)
            {
                await _floorPlanService.PushSceneAsync(user.Id, scene);
                Console.WriteLine("new scene saved");
            }
            else
                await _floorPlanService.UpdateScene(user.Id, scene, ind);

            return Ok();
        }



        string emptyScene = @"{
            ""metadata"": {
                ""version"": 4.5,
                ""type"": ""Object"",
                ""generator"": ""Object3D.toJSON""
            },
            ""geometries"": [
                {
                    ""uuid"": ""163f0a62-8cdc-437a-b3ee-6c2164ead069"",
                    ""type"": ""BoxGeometry"",
                    ""width"": 10,
                    ""height"": 10,
                    ""depth"": 0.2,
                    ""widthSegments"": 1,
                    ""heightSegments"": 1,
                    ""depthSegments"": 1
                },
                {
                    ""uuid"": ""8b24ae3b-3f91-4501-8264-d71b5c515eb4"",
                    ""type"": ""PlaneGeometry"",
                    ""width"": 100,
                    ""height"": 100,
                    ""widthSegments"": 1,
                    ""heightSegments"": 1
                }
            ],
            ""materials"": [
                {
                    ""uuid"": ""3b9de3d6-62ae-458e-a998-080c67dc7eb6"",
                    ""type"": ""MeshPhongMaterial"",
                    ""color"": 10066329,
                    ""emissive"": 0,
                    ""specular"": 1118481,
                    ""shininess"": 30,
                    ""reflectivity"": 1,
                    ""refractionRatio"": 0.98,
                    ""side"": 2,
                    ""depthFunc"": 3,
                    ""depthTest"": true,
                    ""depthWrite"": true,
                    ""colorWrite"": true,
                    ""stencilWrite"": false,
                    ""stencilWriteMask"": 255,
                    ""stencilFunc"": 519,
                    ""stencilRef"": 0,
                    ""stencilFuncMask"": 255,
                    ""stencilFail"": 7680,
                    ""stencilZFail"": 7680,
                    ""stencilZPass"": 7680
                },
                {
            ""uuid"": ""9f30e1ff-731e-4e71-971d-b56592ed86dd"",
                    ""type"": ""MeshBasicMaterial"",
                    ""color"": 16777215,
                    ""reflectivity"": 1,
                    ""refractionRatio"": 0.98,
                    ""side"": 2,
                    ""depthFunc"": 3,
                    ""depthTest"": true,
                    ""depthWrite"": true,
                    ""colorWrite"": true,
                    ""stencilWrite"": false,
                    ""stencilWriteMask"": 255,
                    ""stencilFunc"": 519,
                    ""stencilRef"": 0,
                    ""stencilFuncMask"": 255,
                    ""stencilFail"": 7680,
                    ""stencilZFail"": 7680,
                    ""stencilZPass"": 7680,
                    ""visible"": false
                }
            ],
            ""object"": {
            ""uuid"": ""3d7a9f0a-6ec8-4787-b476-3fb7dcde545e"",
                ""type"": ""Scene"",
                ""layers"": 1,
                ""matrix"": [
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1
                ],
                ""background"": 9031664,
                ""children"": [
                    {
                ""uuid"": ""4985c6f8-c0dd-4996-96d4-aa53e77b6f36"",
                        ""type"": ""DirectionalLight"",
                        ""layers"": 1,
                        ""matrix"": [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            -30,
                            50,
                            -30,
                            1
                        ],
                        ""color"": 16777215,
                        ""intensity"": 1,
                        ""shadow"": {
                    ""camera"": {
                        ""uuid"": ""d19788c6-d62e-4113-8a24-65905325892a"",
                                ""type"": ""OrthographicCamera"",
                                ""layers"": 1,
                                ""zoom"": 1,
                                ""left"": -5,
                                ""right"": 5,
                                ""top"": 5,
                                ""bottom"": -5,
                                ""near"": 0.5,
                                ""far"": 500
                            }
                }
            },
                    {
                ""uuid"": ""01879452-cb27-42ba-9b2b-1005cfc5b458"",
                        ""type"": ""AmbientLight"",
                        ""layers"": 1,
                        ""matrix"": [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        ""color"": 16777215,
                        ""intensity"": 0.2
                    },
                    {
                ""uuid"": ""b0dbeb62-c99d-4c30-b0c7-18ea469d0979"",
                        ""type"": ""Mesh"",
                        ""castShadow"": true,
                        ""receiveShadow"": true,
                        ""userData"": {
                    ""draggable"": false,
                            ""scalable"": true
                        },
                        ""layers"": 1,
                        ""matrix"": [
                            1,
                            0,
                            0,
                            0,
                            0,
                            2.220446049250313e-16,
                            1,
                            0,
                            0,
                            -1,
                            2.220446049250313e-16,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        ""geometry"": ""163f0a62-8cdc-437a-b3ee-6c2164ead069"",
                        ""material"": ""3b9de3d6-62ae-458e-a998-080c67dc7eb6""
                    },
                    {
                ""uuid"": ""5a7b6715-ce41-442f-9f2c-d1352d5c0f0c"",
                        ""type"": ""Mesh"",
                        ""layers"": 1,
                        ""matrix"": [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        ""geometry"": ""8b24ae3b-3f91-4501-8264-d71b5c515eb4"",
                        ""material"": ""9f30e1ff-731e-4e71-971d-b56592ed86dd""
                    }
                ]
            }
        }";
    }
}