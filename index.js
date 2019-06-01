const log = console.log
const assert = require('assert')
const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const session = require('express-session')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(express.static('view'))
app.set('view engine', 'hbs')
app.set('views', __dirname)

const { mongoose } = require('./db/mongoose')
const { ObjectID } = require('mongodb').ObjectID

// Import mongoose models
const { User } = require('./db/models/user.js')
const { Comment } = require('./db/models/comment.js')
const { Course } = require('./db/models/course.js')
const { Project } = require('./db/models/project.js')
const { Application } = require('./db/models/application.js')
const { Credential } = require('./db/models/credential.js')

/* SESSION COOKIES */
app.use(
  session({
    secret: 'oursecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60000 * 60,
      httpOnly: true
    }
  })
)

/* The middleware to check for logged-in users
 * If not loged in, redirect to login
 */
const sessionChecker = (req, res, next) => {
  if (!req.session.user_id) {
    res.sendFile(__dirname + '/view/login.html')
  } else {
    next()
  }
}

/*  route redirection  */
app.get('/', sessionChecker, (req, res) => {
  res.sendFile(__dirname + '/view/index.html')
})

app.route('/login').get(sessionChecker, (req, res) => {
  res.sendFile(__dirname + '/view/login.html')
})

app.get('/find', sessionChecker, (req, res) => {
  res.sendFile(__dirname + '/view/search_group.html')
})

app.get('/invitation', sessionChecker, (req, res) => {
  res.sendFile(__dirname + '/view/inbox.html')
})

/* User signup */
app.post('/users/signup', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const name = req.body.name
  const year = req.body.year
  const temp = new Credential({
    email: email,
    password: password
  })
  temp.save(err => {
    if (err) {
      res.status(400).send()
    }
  })

  const user = new User({
    email: email,
    name: name,
    year: year
  })
  user.save(err => {
    if (err) {
      res.status(400).send()
    }
  })
  res.status(200).send()
})

/* user dashboard */
app.get('/dashboard', (req, res) => {
  if (req.session.user_id) {
    User.findById(req.session.user_id)
      .then(user => {
        if (!user) {
          res.status(404).send()
        } else {
          Comment.find({
            receiver: req.session.user_id
          })
            .then(comments => {
              res.render('view/user_detail.hbs', {
                score: user.rating,
                intro: user.intro,
                courses: user.courses_taken,
                skills: user.skills,
                name: user.name,
                comments: comments,
                icon: user.icon,
                email: user.email,
                empty_courses: user.courses_taken.length === 0,
                empty_skills: user.skills.length === 0,
                empty_reviews: comments.length === 0
              })
            })
            .catch(error => {
              res.status(400).send(error)
            })
        }
      })
      .catch(error => {
        res.status(400).send(error)
      })
  } else {
    res.redirect('/login')
  }
})

/* user account setting */
app.get('/account_setting', (req, res) => {
  if (req.session.user_id) {
    User.findById(req.session.user_id)
      .then(user => {
        if (!user) {
          res.status(404).send()
        } else {
          res.render('view/account_setting.hbs', {
            score: user.rating,
            name: user.name,
            icon: user.icon,
            email: user.email,
            intro: user.intro
          })
        }
      })
      .catch(error => {
        res.status(400).send(error)
      })
  } else {
    res.redirect('/login')
  }
})

/* update the user info */
app.put('/change_info', (req, res) => {
  const new_name = req.body.new_name
  const new_intro = req.body.new_intro
  const new_icon = req.body.new_icon
  const new_psd = req.body.new_psd

  User.findById(req.session.user_id)
    .then(user => {
      user.name = new_name
      user.intro = new_intro
      user.icon = new_icon
      user.save().then(
        user_returned => {
          if (new_psd != '') {
            Credential.findOneAndUpdate(
              {
                email: user_returned.email
              },
              {
                $set: {
                  password: new_psd
                }
              }
            )
              .then(cd => {
                if (!cd) {
                  res.status(500).send()
                } else {
                  res.status(200).send()
                }
              })
              .catch(err => res.status(500).send())
          }
          res.status(200).send()
        },
        error => {
          res.status(400).send(error)
        }
      )
    })
    .catch(error => {
      res.status(400).send(error)
    })
})

/* User login and logout routes */
app.post('/users/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  Credential.findByEmailPassword(email, password)
    .then(cd => {
      if (!cd) {
        res.status(404).send()
      } else {
        // Add the user to the session cookie that we will
        // send to the client
        if (cd.email == 'admin') {
          req.session.user_id = 'secretadmin'
          res.redirect('/admin')
        }
        User.findOne({
          email: email
        })
          .then(user => {
            req.session.user_id = user._id
            res.redirect('/dashboard')
          })
          .catch(err => res.status(404).send())
      }
    })
    .catch(error => {
      res.status(404).send()
    })
})

/* Admin page */
app.get('/admin', (req, res) => {
  if (req.session.user_id == 'secretadmin') {
    res.sendFile(__dirname + '/view/admin.html')
  } else {
    res.redirect('login')
  }
})

/* Destroy admin session */
app.get('/quitAdmin', (req, res) => {
  req.session.destroy(error => {
    if (error) {
      res.status(500).send(error)
    } else {
      res.redirect('/')
    }
  })
})

/* User logout */
app.get('/users/logout', (req, res) => {
  req.session.destroy(error => {
    if (error) {
      res.status(500).send(error)
    } else {
      res.redirect('/')
    }
  })
})

/* Find a credential by email */
app.get('/credential/:email', (req, res) => {
  const email = req.params.email
  Credential.findOne({
    email: email
  })
    .then(cd => {
      if (!cd) {
        res.status(400).send()
      } else {
        res.status(200).send({
          p: cd.password
        })
      }
    })
    .catch(err => res.status(400).send)
})

/* Update the credential's email and password */
app.patch('/credential/:email/:password', (req, res) => {
  const email = req.params.email
  const password = req.params.password
  Credential.findOneAndUpdate(
    {
      email: email
    },
    {
      $set: {
        email: email,
        password: password
      }
    }
  )
    .then(cd => {
      if (!cd) {
        res.status(500).send()
      } else {
        res.status(200).send()
      }
    })
    .catch(err => res.status(500).send())
})

/* Get a user info by email */
app.get('/userinfo/:email', (req, res) => {
  const email = req.params.email
  User.findOne({
    email: email
  })
    .then(u => {
      if (!u) {
        res.status(404).send()
        return
      }
      const obj = {
        name: u.name,
        year: u.year,
        rating: u.rating
      }
      res.status(200).send(obj)
    })
    .catch(err => {
      res.status(404).send()
    })
})

/* Update the user's name, year and rating */
app.patch('/user/:email/:name/:year/:rating', (req, res) => {
  const { email, name, year, rating } = req.params
  User.findOneAndUpdate(
    {
      email: email
    },
    {
      $set: {
        name: name,
        year: year,
        rating: rating
      }
    }
  )
    .then(u => {
      if (!u) {
        res.status(500).send()
      } else {
        res.status(200).send()
      }
    })
    .catch(err => res.status(500).send())
})

app.get('/usernum', (req, res) => {
  Credential.find()
    .then(all =>
      res.status(200).send({
        l: all.length
      })
    )
    .catch(err => res.status(500).send())
})

app.get('/commentnum', (req, res) => {
  Comment.find()
    .then(all =>
      res.status(200).send({
        l: all.length
      })
    )
    .catch(err => res.status(500).send())
})

app.get('/projectnum', (req, res) => {
  Project.find()
    .then(all =>
      res.status(200).send({
        l: all.length
      })
    )
    .catch(err => res.status(500).send())
})

/* Add a course to the data base */
app.post('/course/:course/:term', (req, res) => {
  const course = req.params.course
  const term = req.params.term
  Course.findOne({
    course: course,
    term: term
  })
    .then(c => {
      if (c) {
        res.status(200).send()
      } else {
        Course.insertMany([
          {
            code: course,
            term: term
          }
        ])
          .then(c => {})
          .catch(err => res.status(500).send())
      }
    })
    .catch(err => res.status(500).send())
})

/* Get all the invitations sent to the user */
app.get('/allRequests', (req, res) => {
  Application.find({
    receiver: req.session.user_id
  }).then(apps => {
    res.send(apps)
  })
})

/* Get the invitation of project_id from sender_id to receiver_id */
app.get(
  '/projectInvitation/:project_id/:sender_id/:receiver_id',
  (req, res) => {
    const id = req.params.project_id
    const sender_id = req.params.sender_id
    const receiver_id = req.params.receiver_id

    Project.findById(id)
      .then(project => {
        if (!project) {
          res.status(404).send()
          return
        }
        User.findById(sender_id)
          .then(user => {
            if (!user) {
              res.status(404).send()
              return
            }
            let result = JSON.parse(JSON.stringify(project))
            result.name = user.name
            result.sender_id = sender_id
            result.receiver_id = receiver_id
            res.send(result)
          })
          .catch(err => res.status(500).send())
      })
      .catch(err => res.status(500).send())
  }
)

/* Accept a certain request. */
app.get('/acceptRequest/:project_id/:sender_id', (req, res) => {
  const { project_id, sender_id } = req.params
  // find sender
  User.findById(sender_id)
    .then(user => {
      if (!user) {
        res.status(404).send()
      }

      Project.findById(project_id)
        .then(p => {
          if (p.teammates.filter(x => x._id == sender_id).length > 0) {
          } else {
            p.teammates.push(user)
            p.save()
          }
        })
        .catch(err => res.status(500).send())
      user.projects.push(project_id)
      user.save()
    })
    .catch(err => res.status(500).send())

  Application.findOneAndRemove({
    project_id: project_id,
    sender: sender_id
  }).then(a => {})
  res.redirect('/invitation')
})

/* Decline a certain request. */
app.get('/declineRequest/:project_id/:sender_id', (req, res) => {
  const { project_id, sender_id } = req.params
  Application.findOneAndRemove({
    project_id: project_id,
    sender: sender_id
  }).then(a => {})
  res.redirect('/invitation')
})

// Middleware for authentication for resources
const authenticate = (req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user)
      .then(user => {
        if (!user) {
          return Promise.reject()
        } else {
          req.user = user
          next()
        }
      })
      .catch(error => {
        res.redirect('/login')
      })
  } else {
    res.redirect('/login')
  }
}

app.get('/addadmin', (req, res) => {
  credential.x()
})

app.get('/student/:id', (req, res) => {
  const id = req.params.id
  User.insertMany([
    {
      name: 'ad',
      year: 1
    }
  ])
})

/* Add a course to user.courses_taken */
app.put('/addCourse', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login')
  } else {
    const user = User.findById(req.session.user_id)
      .then(user => {
        if (!user) {
          res.status(404).send()
        } else {
          const course_list = user.courses_taken
          if (!course_list.includes(req.body.course)) {
            course_list.push(req.body.course)
          } else {
            res.status(400).send()
            return
          }

          user.save().then(
            user => {
              res.send(req.body.course)
            },
            error => {
              res.status(400).send(error)
            }
          )
        }
      })
      .catch(error => {
        res.status(500).send()
      })
  }
})

/* Add a skill to user.skills */
app.put('/addSkill', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login')
  } else {
    const user = User.findById(req.session.user_id)
      .then(user => {
        if (!user) {
          res.status(404).send()
        } else {
          const skill_list = user.skills
          if (skill_list.includes(req.body.skill)) {
            res.status(400).send()
            return
          } else {
            skill_list.push(req.body.skill)
          }

          user.save().then(
            user => {
              res.send(req.body.skill)
            },
            error => {
              res.status(400).send(error)
            }
          )
        }
      })
      .catch(error => {
        res.status(500).send()
      })
  }
})

/* Get all the projects that a user is working on */
app.get('/projects', sessionChecker, (req, res) => {
  User.findById(req.session.user_id).then(user => {
    if (!user) {
      res.status(404).send()
    } else {
      const projects = user.projects
      Project.find(
        {
          _id: {
            $in: projects
          }
        },
        function (err, found_projects) {
          res.render('view/projects.hbs', {
            projects: found_projects,
            empty_projects: found_projects.length === 0
          })
        }
      )
    }
  })
})

/* User quit a certain project */
app.delete('/quit_project/:id', sessionChecker, (req, res) => {
  const project_id = req.params.id
  User.findById(req.session.user_id).then(user => {
    if (!user) {
      res.status(404).send()
    } else {
      user.projects = user.projects.filter(project => project != project_id)

      user.save()
      Project.findById(project_id).then(
        foundProject => {
          foundProject.teammates = foundProject.teammates.filter(
            teammate => teammate._id.toString() != req.session.user_id
          )
          foundProject.save()
          res.status(200).send()
        },
        error => {
          res.status(400).send(error)
        },
        error => {
          res.status(400).send(error)
        }
      )
    }
  })
})

// ========================= below is add project page ==========================

/* get add project page */
app.get('/add_project', sessionChecker, (req, res) => {
  res.sendFile(__dirname + '/view/add_project.html')
})

/* add a project */
app.put('/add_project', (req, res) => {
  const course_code = req.body.course_code
  const term = req.body.term
  const section = req.body.section
  const name = req.body.name
  const description = req.body.description

  User.findById(req.session.user_id).then(user => {
    if (!user) {
      res.status(404).send()
      return
    }
    // Create a new project
    const project = new Project({
      course_code: course_code,
      term: term,
      section: section,
      name: name,
      description: description,
      teammates: []
    })
    project.teammates.push(user)
    user.projects.push(project._id.toString())
    user.save()

    // save comment to database
    project.save().then(
      result => {
        res.status(200).send(result)
      },
      error => {
        res.status(400).send(error) // 400 for bad request
      }
    )
  })
})

// ========================= below is profile redirection page ==========================
app.get('/profile/:id', sessionChecker, (req, res) => {
  const id = req.params.id
  if (!ObjectID.isValid(id)) {
    res.status(404).send()
  }

  User.findById(id)
    .then(user => {
      if (!user) {
        res.status(404).send()
      } else {
        Comment.find({
          receiver: id
        })
          .then(comments => {
            res.render('view/public_profile.hbs', {
              score: user.rating,
              intro: user.intro,
              courses: user.courses_taken,
              skills: user.skills,
              name: user.name,
              comments: comments,
              icon: user.icon,
              email: user.email,
              empty_courses: user.courses_taken.length === 0,
              empty_skills: user.skills.length === 0,
              empty_reviews: comments.length === 0
            })
          })
          .catch(error => {
            res.status(400).send(error)
          })
      }
    })
    .catch(error => {
      res.status(400).send(error)
    })
})

// ============ route redirection for search result page ==============

/* search result without the field project name */
app.get('/find/result/:code/:term/:section', sessionChecker, (req, res) => {
  const code = req.params.code
  const term = req.params.term
  const section = req.params.section

  // get the current session user
  User.findOne({
    _id: req.session.user_id
  })
    .then(user => {
      if (!user) {
        res.status(404).send()
      } else {
        // matching section
        if (section != 'ALL') {
          Project.find(
            {
              course_code: code,
              term: term,
              section: section
            },
            function (err, project) {
              if (project.length == 0) {
                res.render('view/no_search_result.hbs', {
                  code: code,
                  term: term,
                  section: section,
                  name: ''
                })
              } else {
                const found_projects = project.filter(function (x) {
                  const mates_id = x.teammates.map(function (teammate) {
                    return teammate._id
                  })
                  const filter_id = mates_id.filter(function (id) {
                    return id != req.session.user_id
                  })
                  return filter_id.length == mates_id.length
                })

                const not_finished_projects = found_projects.filter(function (
                  x
                ) {
                  return x.flag == 0
                })

                if (not_finished_projects.length == 0) {
                  res.render('view/no_search_result.hbs', {
                    code: code,
                    term: term,
                    section: section,
                    name: ''
                  })
                } else {
                  res.render('view/search_result.hbs', {
                    code: code,
                    term: term,
                    section: section,
                    name: '',
                    results: not_finished_projects
                  })
                }
              }
            }
          ).catch(error => {
            res.status(500).send(error)
          })
        } else if (section == 'ALL') {
          Project.find(
            {
              course_code: code,
              term: term
            },
            function (err, project) {
              if (project.length == 0) {
                res.render('view/no_search_result.hbs', {
                  code: code,
                  term: term,
                  section: 'ALL',
                  name: ''
                })
              } else {
                const found_projects = project.filter(function (x) {
                  const mates_id = x.teammates.map(function (teammate) {
                    return teammate._id
                  })
                  const filter_id = mates_id.filter(function (id) {
                    return id != req.session.user_id
                  })
                  return filter_id.length == mates_id.length
                })

                const not_finished_projects = found_projects.filter(function (
                  x
                ) {
                  return x.flag == 0
                })

                if (not_finished_projects.length == 0) {
                  res.render('view/no_search_result.hbs', {
                    code: code,
                    term: term,
                    section: section,
                    name: ''
                  })
                } else {
                  res.render('view/search_result.hbs', {
                    code: code,
                    term: term,
                    section: section,
                    name: '',
                    results: not_finished_projects
                  })
                }
              }
            }
          ).catch(error => {
            res.status(500).send(error)
          })
        }
      }
    })
    .catch(error => {
      res.status(500).send(error)
    })
})

/* search result with the field project name */
app.get(
  '/find/result/:code/:term/:section/:name',
  sessionChecker,
  (req, res) => {
    const code = req.params.code
    const term = req.params.term
    const section = req.params.section
    const name = req.params.name

    // get the current session user
    User.findOne({
      _id: req.session.user_id
    })
      .then(user => {
        if (!user) {
          res.status(404).send()
        } else {
          // matching section
          if (section != 'ALL' && name != '') {
            Project.find(
              {
                course_code: code,
                term: term,
                section: section,
                name: name
              },
              function (err, project) {
                if (project.length == 0) {
                  res.render('view/no_search_result.hbs', {
                    code: code,
                    term: term,
                    section: section,
                    name: name
                  })
                } else {
                  const found_projects = project.filter(function (x) {
                    const mates_id = x.teammates.map(function (teammate) {
                      return teammate._id
                    })
                    const filter_id = mates_id.filter(function (id) {
                      return id != req.session.user_id
                    })
                    return filter_id.length == mates_id.length
                  })

                  const not_finished_projects = found_projects.filter(function (
                    x
                  ) {
                    return x.flag == 0
                  })

                  if (not_finished_projects.length == 0) {
                    res.render('view/no_search_result.hbs', {
                      code: code,
                      term: term,
                      section: section,
                      name: name
                    })
                  } else {
                    res.render('view/search_result.hbs', {
                      code: code,
                      term: term,
                      section: section,
                      name: name,
                      results: not_finished_projects
                    })
                  }
                }
              }
            ).catch(error => {
              res.status(500).send(error)
            })
          } else if (section == 'ALL' && name != '') {
            Project.find(
              {
                course_code: code,
                term: term,
                name: name
              },
              function (err, project) {
                if (project.length == 0) {
                  res.render('view/no_search_result.hbs', {
                    code: code,
                    term: term,
                    section: 'ALL',
                    name: name
                  })
                } else {
                  const found_projects = project.filter(function (x) {
                    const mates_id = x.teammates.map(function (teammate) {
                      return teammate._id
                    })
                    const filter_id = mates_id.filter(function (id) {
                      return id != req.session.user_id
                    })
                    return filter_id.length == mates_id.length
                  })

                  const not_finished_projects = found_projects.filter(function (
                    x
                  ) {
                    return x.flag == 0
                  })

                  if (not_finished_projects.length == 0) {
                    res.render('view/no_search_result.hbs', {
                      code: code,
                      term: term,
                      section: section,
                      name: name
                    })
                  } else {
                    res.render('view/search_result.hbs', {
                      code: code,
                      term: term,
                      section: section,
                      name: name,
                      results: not_finished_projects
                    })
                  }
                }
              }
            ).catch(error => {
              res.status(500).send(error)
            })
          }
        }
      })
      .catch(error => {
        res.status(500).send(error)
      })
  }
)

/* Save the application when user send request to a group */
app.put('/find/result/:code/:term/:section/:name', (req, res) => {
  const project_id = req.body.project_id

  // find the receiver
  Project.findById(project_id)
    .then(project => {
      if (!project) {
        res.status(404).send()
      } else {
        // sent a request to themselves
        if (project.teammates.includes(req.session.user_id)) {
          res.status(406).send('you are already in this group')
        } else {
          const application = new Application({
            sender: req.session.user_id,
            receiver: project.teammates[0]._id,
            project_id: project_id
          })

          application
            .save()
            .then(
              application_returned => {
                res.status(200).send(application_returned)
                // change when sent
              },
              error => {
                res.status(400).send(error)
              }
            )
            .catch(error => {
              res.status(400).send(error)
            })
        }
      }
    })
    .catch(error => {
      res.status(400).send(error)
    })
})

// ============ route redirection for finsh project page profile redirection ==============
app.get('/find/result/profile/:email', sessionChecker, (req, res) => {
  const email = req.params.email // get the email (unique) of the user object

  // validate the email
  User.findOne({
    email: email
  })
    .then(user => {
      if (!user) {
        res.status(404).send()
      } else {
        res.redirect('/profile/' + user.id)
      }
    })
    .catch(error => {
      res.status(500).send(error)
    })
})

// ============ route redirection for finsh project page  ==============
app.get('/finish_project/:id', sessionChecker, (req, res) => {
  const project_id = req.params.id

  Project.findOne({
    _id: project_id
  })
    .then(project => {
      if (!project) {
        res.status(404).send()
      } else {
        const group_without_self = project.teammates.filter(function (person) {
          return person._id != req.session.user_id
        })

        res.render('./view/finish_project.hbs', {
          teammates: group_without_self,
          empty_temmate: group_without_self.length == 0
        })
      }
    })
    .catch(error => {
      res.status(500).send(error)
    })
})

/* save project information when save project */
app.put('/finish_project/:id', sessionChecker, (req, res) => {
  const project_id = req.params.id

  const receiver_email = req.body.receiver_email
  const content = req.body.content
  const rating = req.body.rating
  const flag = req.body.flag

  Project.findById(project_id)
    .then(project => {
      if (!project) {
        res.status(404).send()
      } else {
        if (project.flag == 0) {
          project.flag = 1
          project.save()
        }
      }
    })
    .catch(error => {
      res.status(400).send(error)
    })

  User.findById(req.session.user_id)
    .then(user => {
      if (!user) {
        res.status(404).send()
      } else {
        // remove the project from the user.projects array
        if (user.projects.length > 0) {
          user.projects = user.projects.filter(function (project) {
            return project != project_id
          })
          user.save()
        }

        // find receiver email
        User.findOne({
          email: receiver_email
        })
          .then(user2 => {
            if (!user2) {
              res.status(404).send()
            } else {
              // save rating
              const receiver_id = user2._id
              const user2_rating =
                (user2.rating * (user2.rate_received + 1) + parseInt(rating)) /
                (user2.rate_received + 2)
              user2.rating = Math.round(user2_rating * 10) / 10
              user2.rate_received++
              user2.save()

              // Create a new comment
              const comment = new Comment({
                project_id: project_id,
                sender: req.session.user_id,
                sender_name: user.name,
                receiver: receiver_id.toString(),
                content: content,
                rating: parseInt(rating),
                flag: flag
              })

              // save comment to database
              comment.save().then(
                result => {
                  // Save and send object that was saved
                  res.send(result)
                },
                error => {
                  res.status(400).send(error) // 400 for bad request
                }
              )
            }
          })
          .catch(error => {
            res.status(500).send(error)
          })
      }
    })
    .catch(error => {
      es.status(500).send()
    })
})

app.listen(port)
